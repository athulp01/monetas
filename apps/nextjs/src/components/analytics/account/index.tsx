import { AccountBalanceLine } from "./AccountBalanceLine";

interface Props {
  rangeStart: moment.Moment;
  rangeEnd: moment.Moment;
}
export const AccountAnalytics = ({ rangeStart, rangeEnd }: Props) => {
  return (
    <div className="grid grid-cols-1  gap-y-16">
      <div className="h-72">
        <AccountBalanceLine
          rangeEnd={rangeEnd}
          rangeStart={rangeStart}
        ></AccountBalanceLine>
      </div>
    </div>
  );
};
