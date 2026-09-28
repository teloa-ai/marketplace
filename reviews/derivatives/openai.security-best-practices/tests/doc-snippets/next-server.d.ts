// R2：仅供 tsc 类型检查的最小桩（本机未装 next）；只声明片段用到的成员。
declare module "next/server" {
  export class NextRequest extends Request {
    readonly nextUrl: URL;
  }
  export class NextResponse extends Response {
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
  }
}
