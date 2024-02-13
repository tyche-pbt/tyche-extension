import { ExampleFilter, SampleInfo, TestInfo } from "../report";
import Card from "../ui/Card";
import Tooltip from "../ui/Tooltip";

type HighLevelStatsProps = {
  property: string;
  testInfo: TestInfo;
  setExampleFilter: (filter: ExampleFilter) => void;
};

type BreakdownProps = {
  samples: SampleInfo[];
  setExampleFilter: (filter: ExampleFilter) => void;
};

const isValid = (x: SampleInfo) => x.outcome === "passed" || x.outcome === "failed";
const isDiscarded = (x: SampleInfo) => x.outcome === "invalid";
const isGaveUp = (x: SampleInfo) => x.outcome === "gave_up";

const isUnique = (x: SampleInfo) => !x.duplicate;
const isDuplicate = (x: SampleInfo) => x.duplicate;

// const Breakdown = (props: BreakdownProps) => {
//   const { samples, setExampleFilter } = props;

//   const validity: [string, (x: SampleInfo) => boolean][] = [
//     ["Valid", isValid],
//     ["Discarded", isDiscarded],
//     ["Gave Up", isGaveUp],
//   ];

//   const uniqueness: [string, (x: SampleInfo) => boolean][] = [
//     ["Unique", isUnique],
//     ["Duplicate", isDuplicate],
//   ];

//   return <table className="table-auto w-full">
//     <thead>
//       <tr>
//         <td></td>
//         {uniqueness.map(([key, _]) =>
//           <td key={key + "-head"} className="font-bold px-2">{key}</td>)}
//         <td className="px-2 italic">Total</td>
//       </tr>
//     </thead>
//     <tbody>
//       {validity.map(([validityKey, validityPred]) => {
//         return <tr key={validityKey + "-row"}>
//           <td className="font-bold">{validityKey}</td>
//           {uniqueness.map(([uniquenessKey, uniquenessPred]) => {
//             const slice = samples.filter(validityPred).filter(uniquenessPred);
//             return <td
//               key={validityKey + "-" + uniquenessKey + "-cell"}
//               className="hover:bg-primary hover:bg-opacity-25 cursor-pointer rounded-md px-2"
//               onClick={() =>
//                 setExampleFilter({
//                   subset: validityKey + ", " + uniquenessKey,
//                   examples: slice
//                 })}>
//               {slice.length}
//             </td>;
//           })}
//           <td
//             className="hover:bg-primary hover:bg-opacity-25 cursor-pointer rounded-md px-2 italic"
//             onClick={() =>
//               setExampleFilter({
//                 subset: validityKey,
//                 examples: samples.filter(validityPred)
//               })} >
//             {samples.filter(validityPred).length}
//           </td>
//         </tr>;
//       })}
//       <tr>
//         <td className="italic">Total</td>
//         {uniqueness.map(([key, pred]) => {
//           const slice = samples.filter(pred);
//           return <td
//             key={key + "-total"}
//             className="hover:bg-primary hover:bg-opacity-25 cursor-pointer rounded-md px-2 italic"
//             onClick={() =>
//               setExampleFilter({
//                 subset: key,
//                 examples: slice
//               })}>
//             {slice.length}
//           </td>;
//         })}
//         <td
//           className="hover:bg-primary hover:bg-opacity-25 cursor-pointer rounded-md px-2 italic"
//           onClick={() =>
//             setExampleFilter({
//               subset: "",
//               examples: samples
//             })}>
//           {samples.length}</td>
//       </tr>
//     </tbody>
//   </table>;
// }

const Breakdown = (props: BreakdownProps) => {
  const { samples, setExampleFilter } = props;

  const validity: [string, (x: SampleInfo) => boolean][] = [
    ["Valid", isValid],
    ["Discarded", isDiscarded],
    ["Gave Up", isGaveUp],
  ];

  const uniqueness: [string, (x: SampleInfo) => boolean][] = [
    ["Unique", isUnique],
    ["Duplicate", isDuplicate],
  ];

  return <>
    <div className="flex justify-between ml-20 mr-10">
      {uniqueness.map(([uniquenessKey, uniquenessPred]) => {
        const width = samples.filter(uniquenessPred).length / samples.length * 100;
        if (!width) return null;
        return <span
          key={uniquenessKey + "-label"}
          className="text-sm font-bold">
          {uniquenessKey}</span>
      })}
    </div>
    <div className="flex">
      <div className="w-24">
        {validity.map(([validityKey, validityPred]) => {
          const height = samples.filter(validityPred).length / samples.length * 100;
          if (!height) return null;
          return <div
            key={validityKey + "-label"}
            className="text-sm flex items-center font-bold"
            style={{ height: height + "%" }}>
            {validityKey}</div>
        })}
      </div>
      <div className="w-full h-48">
        {validity.map(([validityKey, validityPred], i) =>
          uniqueness.map(([uniquenessKey, uniquenessPred]) => {
            const colors = ["success", "warning", "accent3"];
            const slice = samples.filter(validityPred).filter(uniquenessPred);
            const width = slice.length / samples.filter(validityPred).length * 100;
            const height = samples.filter(validityPred).length / samples.length * 100;
            const bg = `bg-${colors[i]} ${uniquenessKey === "Duplicate" ? "bg-opacity-60 " : ""}`;
            const textDec = validityKey === "Valid" && uniquenessKey === "Unique" ? "font-bold" : "";
            if (!width || !height) return null;
            return <div
              key={validityKey + "-" + uniquenessKey + "-cell"}
              style={{ width: width + "%", height: height + "%" }}
              className="float-left text-sm p-0.5"
              onClick={() =>
                setExampleFilter({
                  subset: validityKey + ", " + uniquenessKey,
                  examples: slice
                })}>
              <div className={"w-full h-full hover:bg-opacity-70 cursor-pointer flex items-center justify-center " + bg + textDec}>
                {slice.length}
              </div>
            </div>;
          }))}
      </div>
      <div className="w-10">
        {validity.map(([validityKey, validityPred]) => {
          const slice = samples.filter(validityPred);
          const height = slice.length / samples.length * 100;
          if (!height) return null;
          return <div
            key={validityKey + "-label"}
            className="text-sm flex items-center italic text-right hover:bg-primary hover:bg-opacity-25 cursor-pointer rounded-md px-1"
            style={{ height: height + "%" }}
            onClick={() =>
              setExampleFilter({
                subset: validityKey,
                examples: slice
              })}>
            {slice.length}</div>
        })}
      </div>
    </div>
    <div className="flex justify-between ml-20 mr-10">
      {uniqueness.map(([uniquenessKey, uniquenessPred]) => {
        const slice = samples.filter(uniquenessPred);
        const width = slice.length / samples.length * 100;
        if (!width) return null;
        return <span
          key={uniquenessKey + "-label"}
          className="text-sm italic hover:bg-primary hover:bg-opacity-25 cursor-pointer rounded-md px-2"
          onClick={() =>
            setExampleFilter({
              subset: uniquenessKey,
              examples: slice
            })}>
          {slice.length}</span>
      })}
    </div>
  </>;
}

export const HighLevelStats = (props: HighLevelStatsProps) => {

  const samples = props.testInfo.samples;
  const discards = props.testInfo.samples.filter(isDiscarded);
  const duplicates = props.testInfo.samples.filter((x) => isDuplicate(x) && !isGaveUp(x));
  const discardPercent = Math.round(discards.length / samples.length * 100);
  const duplicatePercent = Math.round(duplicates.length / samples.length * 100);
  const uniqueValid = props.testInfo.samples.filter((x) => isValid(x) && isUnique(x));

  return <div className="grid grid-cols-2 w-full">
    <Card className="col-span-1">
      <div className="opacity-60 text-sm">Tested</div>
      <span className="text-3xl">
        {uniqueValid.length}
      </span> unique cases.
    </Card>
    <Card className="col-span-1">
      <div className="opacity-60 text-sm">Generated</div>
      <span className="text-3xl">
        {samples.length}
      </span> samples.
    </Card>
    {discardPercent > 33 &&
      <Card className="col-span-2">
        <div className="flex">
          <div className="opacity-60 text-sm flex-1">Discarded</div>
          <div className="text-sm text-white rounded-full font-bold px-2 bg-warning"
            title="This property has a high proportion of discarded samples. Consider writing a generator that enforces preconditions by construction.">
            {">33%"}
          </div>
        </div>
        <span className="text-3xl">
          {discards.length}
        </span> invalid samples.
      </Card>}
    {duplicatePercent > 33 &&
      <Card className="col-span-2">
        <div className="flex">
          <div className="opacity-60 text-sm flex-1">Revisited</div>
          <div className="text-sm text-white rounded-full font-bold px-2 bg-warning"
            title="This property has a high proportion of duplicate samples. Consider generating in a larger space.">
            {">33%"}
          </div>
        </div>
        <span className="text-3xl">
          {duplicates.length}
        </span> duplicates.
      </Card>}
    <Card className="col-span-2">
      <div className="flex-1">
        <span className="text-nowrap overflow-hidden overflow-ellipsis font-bold mb-1">
          Sample Breakdown
        </span> <Tooltip>
          Click on a region of the chart to see the samples that contribute to it.
          <br />
          Uniqueness is computed based on the string representation of each sample.
        </Tooltip>
      </div>
      <Breakdown samples={props.testInfo.samples} setExampleFilter={props.setExampleFilter} />
    </Card>
  </div >;
};
