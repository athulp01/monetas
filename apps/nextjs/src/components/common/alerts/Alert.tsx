interface Props {
  text: string;
  type: "success" | "info" | "warning" | "error";
}
export const Alert = (props: Props) => {
  const { text, type } = props;
  const bgColor = {
    success: "bg-green-50",
    info: "bg-blue-50",
    warning: "bg-yellow-50",
    error: "bg-red-50",
  };
  const textColor = {
    success: "text-green-800",
    info: "text-blue-800",
    warning: "text-yellow-800",
    error: "text-red-800",
  };
  return (
    <div
      className={`mb-4 flex  p-4 text-sm ${bgColor[type]} ${textColor[type]}`}
      role="alert"
    >
      <svg
        aria-hidden="true"
        className="mr-3 inline h-5 w-5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        ></path>
      </svg>
      <div>{text}</div>
    </div>
  );
};
