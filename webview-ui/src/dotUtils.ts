export type ExampleJson = string | number | ExampleJson[] | { tag: string, contents?: ExampleJson[] };

export function toDOT(json: object): string {
  return _toDOT(json as ExampleJson);
}

function _toDOT(json: ExampleJson): string {
  const color = "white";

  let node_id = 0;
  const aux = (parent: string | null, json: ExampleJson): string[] => {
    const node = `node${node_id++}`;

    let nodeDecl = "";
    let contents: ExampleJson[] = [];
    if (typeof json === "number" || typeof json === "string") {
      nodeDecl = `${node}[label="${json}"];`;
      contents = [];
    } else if (Array.isArray(json)) {
      const tag = "";
      contents = json;
      const args = contents?.map((x) => typeof x === "number" || typeof x === "string" ? `${x}` : "_").join(", ");
      nodeDecl = args.length === 0 ? `${node}[label="[]"];` : `${node}[label="${tag}${args ? `[${args}]` : ""}"];`;
    } else {
      const tag = (json as { tag: string }).tag;
      contents = (json as { contents: ExampleJson[] }).contents;
      const args = contents?.map((x) => typeof x === "number" || typeof x === "string" ? `${x}` : "_").join(", ");
      nodeDecl = `${node}[label="${tag}${args ? `(${args})` : ""}"];`;
    }

    const parentLink = parent ? `${parent} -> ${node};` : "";
    const rest = contents?.filter((v) => !(typeof v === "number" || typeof v === "string"))
      .flatMap((x) => aux(node, x)) ?? [];

    return [nodeDecl, parentLink, ...rest];
  };

  const dot = `digraph tree {
    fontname = "Courier";
    graph [ordering=out,bgcolor=transparent;];
    node [shape=box,color=${color},fontcolor=${color}];
    edge [color=${color}];

    ${aux(null, json).join("\n")}
  }`;
  return dot;
}