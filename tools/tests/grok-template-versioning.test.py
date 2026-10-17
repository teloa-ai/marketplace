"""Run with TELOA_GROK_TEMPLATE_SOURCE set to the fixed upstream checkout.

These tests exercise generation and file preservation, not model output quality.
"""
import copy
import importlib.util
import json
import os
import sys
from pathlib import Path
import tempfile
import unittest

sys.dont_write_bytecode = True


REPO = Path(__file__).resolve().parents[2]
BOTS = ("competitor-watch", "content-remix", "newsletter-desk")
ALIASES = {
    "competitor-watch-working-method": "grok-marketing-1-0-1-competitor-watch-working-method",
    "diff-competitors": "grok-marketing-1-0-1-diff-competitors",
    "content-remix-working-method": "grok-marketing-1-0-1-content-remix-working-method",
    "remix-content": "grok-marketing-1-0-1-remix-content",
    "newsletter-desk-working-method": "grok-marketing-1-0-1-newsletter-desk-working-method",
    "draft-newsletter": "grok-marketing-1-0-1-draft-newsletter",
}
OLD_CAUSE = 'If a page is unavailable, write "page not found"'


class MarketingVersioning(unittest.TestCase):
    def setUp(self):
        source = os.environ.get("TELOA_GROK_TEMPLATE_SOURCE")
        if not source:
            raise RuntimeError("Set TELOA_GROK_TEMPLATE_SOURCE to the pinned 4f3f28b4 upstream source")
        self.source = Path(source).resolve()
        spec = importlib.util.spec_from_file_location("grok_generator", REPO / "tools/build-grok-bot-template-teams.py")
        self.gen = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.gen)
        self.temp = tempfile.TemporaryDirectory(prefix="teloa-marketing-generation-")
        self.addCleanup(self.temp.cleanup)
        self.output = Path(self.temp.name)
        self.gen.ROOT = self.output
        self.gen.VERSION = "1.0.1"
        self.gen.MISSING_SOURCE_POLICY = "evidence-v1"
        self.review = json.loads((REPO / "reviews/solutions/teloa.grok-marketing-team.json").read_text())

    def generate(self):
        self.gen.build_team(self.source, "marketing", (self.source / "LICENSE").read_bytes(), {
            "originalFiles": {"marketing": self.review["originalFiles"]}
        })
        return self.output / "artifacts/solutions/teloa.grok-marketing-team/1.0.1"

    def test_generated_role_and_working_method_share_evidence_based_missing_source_policy(self):
        package = self.generate()
        role = json.loads((package / "roles/competitor-watch.json").read_text())
        self.assertNotIn(OLD_CAUSE, role["dataScope"])
        self.assertNotIn(OLD_CAUSE, role["responsibility"]["escalationRules"][0])
        method = (package / f"skills/{ALIASES['competitor-watch-working-method']}/SKILL.md").read_text()
        self.assertNotIn(OLD_CAUSE, method)
        policy = role["responsibility"]["escalationRules"][0].removeprefix("No data: ")
        self.assertIn(policy, role["dataScope"])
        self.assertIn(policy, method)
        self.assertIn("cause as unknown", policy)
        self.assertIn("real tool response", policy)

    def test_versioned_native_names_are_used_by_resources_roles_and_routines(self):
        package = self.generate()
        manifest = json.loads((package / "teloa.json").read_text())
        skills = [r for r in manifest["resources"] if r["kind"] == "skill"]
        self.assertEqual({r["id"] for r in skills}, set(ALIASES.values()))
        for resource in skills:
            markdown = (package / resource["source"]["path"]).read_text()
            frontmatter = self.gen.yaml.safe_load(markdown.split("---", 2)[1])
            self.assertEqual(frontmatter["name"], resource["id"])
            self.assertEqual(resource["version"], "1.0.1")
            self.assertLessEqual(len(frontmatter["name"]), 64)
        self.assertEqual(sum(r["kind"] == "role-skill" for r in manifest["relations"]), 6)
        self.assertTrue(all(r["to"] in ALIASES.values() for r in manifest["relations"] if r["kind"] == "role-skill"))
        for bot in BOTS:
            entry = json.loads((self.output / f"catalog/roles/teloa.grok-{bot}.json").read_text())
            self.assertEqual(entry["version"], "1.0.1")
            self.assertEqual(entry["role"]["fromSolution"]["version"], "1.0.1")
            self.assertTrue(all(name in ALIASES.values() for name in entry["role"]["skills"]))
        for routine in (package / "routines").glob("*.json"):
            self.assertTrue(all(s["id"] in ALIASES.values() and s["version"] == "1.0.1" for s in json.loads(routine.read_text())["skills"]))

    def test_existing_solution_target_is_refused_without_deleting_its_bytes(self):
        target = self.output / "artifacts/solutions/teloa.grok-marketing-team/1.0.1"
        target.mkdir(parents=True)
        marker = target / "keep-original.txt"
        marker.write_bytes(b"existing version must survive")
        with self.assertRaisesRegex(SystemExit, "exists"):
            self.generate()
        self.assertEqual(marker.read_bytes(), b"existing version must survive")
        self.assertFalse((self.output / "catalog").exists())

    def test_existing_employee_target_is_refused_before_any_family_write(self):
        target = self.output / "artifacts/roles/teloa.grok-content-remix/1.0.1"
        target.mkdir(parents=True)
        marker = target / "keep-original.txt"
        marker.write_bytes(b"existing employee version must survive")
        with self.assertRaisesRegex(SystemExit, "exists"):
            self.generate()
        self.assertEqual(marker.read_bytes(), b"existing employee version must survive")
        self.assertFalse((self.output / "artifacts/solutions").exists())

    def test_raw_references_licenses_and_other_employee_definitions_are_unchanged(self):
        package = self.generate()
        previous = REPO / "artifacts/solutions/teloa.grok-marketing-team/1.0.0"
        for path in (previous / "references").rglob("*"):
            if path.is_file():
                self.assertEqual((package / path.relative_to(previous)).read_bytes(), path.read_bytes())
        self.assertEqual((package / "LICENSE").read_bytes(), (previous / "LICENSE").read_bytes())
        for bot in BOTS[1:]:
            self.assertEqual((package / f"roles/{bot}.json").read_bytes(), (previous / f"roles/{bot}.json").read_bytes())
        for original, alias in ALIASES.items():
            if original == "competitor-watch-working-method":
                continue
            before = (previous / f"skills/{original}/SKILL.md").read_text()
            self.assertTrue((package / f"skills/{alias}/SKILL.md").is_file(), "Versioned method file is required")
            after = (package / f"skills/{alias}/SKILL.md").read_text()
            if original.endswith("-working-method"):
                profile = (previous / f"references/{original.removesuffix('-working-method')}/PROFILE.md").read_text()
                self.assertTrue(after.endswith(profile))
            else:
                # Original six-field instructions are unchanged; only frontmatter and adaptation notice vary.
                self.assertEqual(after.split("## ", 1)[1], before.split("## ", 1)[1])
                self.assertEqual((package / f"skills/{alias}/skill.yaml").read_bytes(), (previous / f"skills/{original}/skill.yaml").read_bytes())

    def test_changed_pinned_no_data_source_is_refused_instead_of_guessing(self):
        template = self.gen.read_yaml(self.source / "templates/marketing/competitor-watch/template.yaml")
        team = self.gen.read_yaml(self.source / "teams/marketing/team.yaml")
        changed = copy.deepcopy(template)
        changed["no_data"] += " A changed upstream rule."
        with self.assertRaisesRegex(SystemExit, "no_data|source"):
            self.gen.role_definition("competitor-watch", changed, team, list(team["bots"]))

    def test_human_title_successors_match_catalog_and_preserve_execution_bodies(self):
        for family, previous, successor in (("marketing", "1.0.1", "1.0.2"), ("product", "1.0.0", "1.0.1"), ("sales", "1.0.0", "1.0.1")):
            with self.subTest(family=family):
                self.gen.VERSION = successor
                self.gen.HUMAN_TITLES = True
                self.gen.MISSING_SOURCE_POLICY = "evidence-v1" if family == "marketing" else None
                entry_id = f"teloa.grok-{family}-team"
                review = json.loads((REPO / f"reviews/solutions/{entry_id}.json").read_text())
                self.gen.build_team(self.source, family, (self.source / "LICENSE").read_bytes(), {
                    "originalFiles": {family: review["originalFiles"]}
                })
                before = REPO / f"artifacts/solutions/{entry_id}/{previous}"
                after = self.output / f"artifacts/solutions/{entry_id}/{successor}"
                old = json.loads((before / "teloa.json").read_text())
                manifest = json.loads((after / "teloa.json").read_text())
                entry = json.loads((self.output / f"catalog/solutions/{entry_id}.json").read_text())
                titles = entry["solution"]["title"]
                self.assertEqual(manifest["title"], titles["en"])
                self.assertEqual(manifest["localized"]["title"]["original"], manifest["title"])
                self.assertEqual(manifest["localized"]["title"]["locales"], titles)
                self.assertNotIn("grok-bot-templates", manifest["title"])
                self.assertIn("cobusgreyling/grok-bot-templates", manifest["description"])
                for path in (before / "references").rglob("*"):
                    if path.is_file():
                        self.assertEqual((after / path.relative_to(before)).read_bytes(), path.read_bytes())
                self.assertEqual((after / "LICENSE").read_bytes(), (before / "LICENSE").read_bytes())
                old_skills = [r for r in old["resources"] if r["kind"] == "skill"]
                new_skills = [r for r in manifest["resources"] if r["kind"] == "skill"]
                self.assertEqual(len(old_skills), len(new_skills))
                names = {a["id"]: b["id"] for a, b in zip(old_skills, new_skills)}
                self.assertTrue(set(names).isdisjoint(names.values()))
                for a, b in zip(old_skills, new_skills):
                    self.assertTrue(b["id"].startswith(f"grok-{family}-{successor.replace('.', '-')}-"))
                    self.assertLessEqual(len(b["id"]), 64)
                    old_text = (before / a["source"]["path"]).read_text()
                    new_text = (after / b["source"]["path"]).read_text()
                    # Only frontmatter and existing version-name references may differ.
                    expected = old_text.replace(f"name: {a['id']}\n", f"name: {b['id']}\n", 1)
                    if family == "marketing":
                        expected = expected.replace(f"`{a['id']}`", f"`{b['id']}`")
                    self.assertEqual(new_text, expected)
                for resource in manifest["resources"]:
                    if resource["kind"] != "role":
                        continue
                    self.assertEqual((after / resource["source"]["path"]).read_bytes(), (before / resource["source"]["path"]).read_bytes())
                    role = json.loads((self.output / f"catalog/roles/teloa.grok-{resource['id']}.json").read_text())
                    self.assertEqual(role["version"], successor)
                    self.assertEqual(role["role"]["fromSolution"]["version"], successor)
                    self.assertTrue(set(role["role"]["skills"]).issubset(names.values()))
                expected_relations = [{**r, "to": names.get(r["to"], r["to"])} for r in old["relations"]]
                self.assertEqual(manifest["relations"], expected_relations)


if __name__ == "__main__":
    unittest.main()
