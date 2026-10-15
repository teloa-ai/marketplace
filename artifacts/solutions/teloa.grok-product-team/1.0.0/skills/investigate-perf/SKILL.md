---
name: investigate-perf
description: A named latency, error, or resource hotspot needs an evidence write-up from dashboards, traces, and code — without touching alerts or production.
---

# Investigate Perf

> Derived work: adapted by Teloa from cobusgreyling/grok-bot-templates@4f3f28b4e657 skills/investigate-perf/SKILL.md (MIT). Teloa added this frontmatter and notice and removed the Grok Bot paste/composer instructions; the six-field method below is unchanged. See MODIFICATIONS.md.

A useful skill states the six fields from [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations).

## 1. When to use it

A named latency, error, or resource hotspot needs an evidence write-up from dashboards, traces, and code — without touching alerts or production.


## 2. Required inputs and access

- Symptom and time window (e.g. checkout latency since yesterday's release)
- Observability dashboards, traces, or flamegraphs the owner can open
- Source-control links (GitHub) for the suspected change

## 3. Sequence of work

1. Restate the symptom and window. List which dashboards and traces you actually opened.
2. Identify the highest-confidence hotspot with screenshots or direct links.
3. Separate facts (what the chart shows) from hypotheses (why).
4. Map to a commit or PR when the connector shows one. Do not change alerts, flags, or production settings.

## 4. How to validate the result

The hotspot has a link or screenshot. Facts and hypotheses are labeled. Alerts and production settings are unchanged.


## 5. What to return

Short write-up: Symptom, Window, Hotspot, Facts, Hypotheses, Next check, Action log.


## 6. What requires approval

Do not change alerts, feature flags, or production settings. Do not page anyone or merge a "fix" PR.
