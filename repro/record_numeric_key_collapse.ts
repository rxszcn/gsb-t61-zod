import { z } from "../packages/zod/src/index.ts";

const show = (label: string, ...v: any[]) => console.log(label, ...v);

const rec = z.record(z.number(), z.string());

// 数值键 record：两个不同的输入键被折叠成同一个输出键，前一个值静默丢失
show("'1'&'01'   ->", JSON.stringify(rec.parse({ "1": "x", "01": "y" })));
show("'1'&'1.0'  ->", JSON.stringify(rec.parse({ "1": "x", "1.0": "y" })));
show("'0'&'-0'   ->", JSON.stringify(rec.parse({ "0": "a", "-0": "b" })));

const keys = Object.keys(rec.parse({ "1": "x", "01": "y" }));
show("输入两个不同键 '1'/'01'，输出条数 =", keys.length, "期望 2，现状", keys.length, "(塌成 1 条即静默丢数据)");

// 反过来，Number 能解析、却被判非法键：折叠判据与 Number() 不一致
const r1e3: any = rec.safeParse({ "1e3": "a", "1000": "b" });
show("'1e3'&'1000' ->", r1e3.success ? JSON.stringify(r1e3.data) : "ERR " + r1e3.error.issues.map((i: any) => i.code + "@" + String(JSON.stringify(i.path))).join(","));
const rsp: any = rec.safeParse({ " 1": "a" });
show("' 1'(带空格) ->", rsp.success ? JSON.stringify(rsp.data) : "ERR invalid key（但 Number(' 1')=1）");

// 对照：普通对象键不做数字归一，不会塌
show("object 对照     ->", JSON.stringify(z.object({ "1": z.string(), "01": z.string() }).parse({ "1": "x", "01": "y" })));
