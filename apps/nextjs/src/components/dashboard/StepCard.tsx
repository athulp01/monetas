import { mdiCheck } from "@mdi/js";

import IconRounded from "~/components/common/icon/IconRounded";

interface Props {
  heading: string;
  description: string;
  imageSrc: string;
  actionName: string;
  actionHandler: () => void;
  isCompleted?: boolean;
}
export const StepCard = (props: Props) => {
  return (
    <div className="flex max-w-sm flex-wrap rounded-lg border-0 border-gray-200 bg-white  dark:border-gray-700 dark:bg-gray-800">
      <img className="h-40 rounded-t-lg" src={props.imageSrc} alt="" />
      <div className="flex min-h-max flex-wrap p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {props.heading}
        </h5>
        <div className={"flex flex-wrap "}>
          <p className="mb-3 min-w-full text-sm font-light text-gray-700 dark:text-gray-400">
            {props.description}
          </p>
        </div>
        {props.isCompleted && (
          <div className="flex w-full flex-wrap items-center justify-between">
            <div className="flex items-center">
              <IconRounded color={"success"} icon={mdiCheck}></IconRounded>
              <p className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                Completed
              </p>
            </div>
          </div>
        )}
        {!props.isCompleted && (
          <div
            onClick={props.actionHandler}
            className="flex inline-flex flex-wrap items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {props.actionName}
            <svg
              className="ml-2 h-3.5 w-3.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
