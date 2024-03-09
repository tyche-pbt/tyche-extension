import Card from "../ui/Card";

type StatusProps = {
  status: "success" | "failure" | "warning";
};

const Status = (props: StatusProps) => {
  return <div className="w-full mt-2">
    <Card>
      <div>
        {props.status === "success" &&
          <>
            <div className="text-success font-bold">
              Test Passed
            </div> We did not find any issues with your tests, but you may still want to evaluate the
            distributions below.
          </>}
        {props.status === "failure" &&
          <>
            <div className="text-error font-bold">
              Test Failed
            </div> See below for a list of counter-examples.
          </>}
        {props.status === "warning" &&
          <>
            <div className="text-warning font-bold">
              Test Passed with Warnings
            </div> No counter-examples were found, but there is a high proportion of invalid or
            duplicate samples.
          </>}
      </div>
    </Card>
  </div>;
}

export default Status;