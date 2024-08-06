import React, { useState, ChangeEvent, FormEvent } from "react";
import csv from "csvtojson";
import { groupBy, keys, map, mapValues, orderBy, set, uniqBy } from "lodash";
import clsx from "clsx";
import { format } from "date-fns";

const FileUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [uniqueTasks, setUniqueTasks] = useState<Record<string, any>>({});

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const csvData = event.target?.result as string;
      csv()
        .fromString(csvData)
        .then((data) => {
          const mappedUniqueTasks = mapUniqueTasks(data);
          setUniqueTasks(mappedUniqueTasks);
        });
    };
    reader.readAsText(file);
  };

  const table = Object.keys(uniqueTasks).length && (
    <table className={clsx("border-2")}>
      <tr className={clsx("border-2")}>
        <th className={clsx("border-2")}>Username</th>
        <th className={clsx("border-2")}>Date</th>
        <th className={clsx("border-2")}>Day</th>
        <th className={clsx("border-2")}>Task Name</th>
        <th className={clsx("border-2")}>Time Spent Text</th>
        <th className={clsx("border-2")}>Hours Spent</th>
      </tr>
      {Object.keys(uniqueTasks).map((user) => {
        const tasks = uniqueTasks[user].map((task: any) => {
          return (
            <tr className={clsx("border-2")}>
              <td className={clsx("border-2")}>{user}</td>
              <td className={clsx("border-2")}>
                {format(task["Start Text"], "yyyy-MM-dd")}
              </td>
              <td className={clsx("border-2")}>
                {format(task["Start Text"], "eeee")}
              </td>
              <td className={clsx("border-2")}>{task["Task Name"]}</td>
              <td className={clsx("border-2")}>{task["Time Tracked Text"]}</td>
              <td className={clsx("border-2")}>
                {task["Time Tracked"] / (1000 * 60 * 60)}
              </td>
            </tr>
          );
        });
        return (
          <>
            {tasks}
            <tr>
              <td className={clsx("border-2")} colSpan={6}></td>
            </tr>
          </>
        );
      })}
    </table>
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </div>
        <button type="submit">Format</button>
      </form>
      {message && <p>{message}</p>}
      {table}
    </div>
  );
};

export default FileUploadForm;

function mapUniqueTasks(data: any[]) {
  const groupedByUsername = groupBy(data, (i) => i["Username"]);
  console.log(groupedByUsername);
  const uniqTasksMappedByUsername = mapValues(groupedByUsername, (i) => {
    return orderBy(i, (j) => j["Start"]);
  });
  return uniqTasksMappedByUsername;
}
