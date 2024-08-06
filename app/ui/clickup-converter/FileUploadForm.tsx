import React, { useState, ChangeEvent, FormEvent } from "react";
import csv from "csvtojson";
import { groupBy, keys, map, mapValues, set, uniqBy } from "lodash";
import clsx from "clsx";

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
    <table className={clsx("border")}>
      <tr className={clsx("border")}>
        <th className={clsx("border")}>Username</th>
        <th className={clsx("border")}>Task Name</th>
        <th className={clsx("border")}>Time Spent Text</th>
        <th className={clsx("border")}>hours spent</th>
      </tr>
      {Object.keys(uniqueTasks).map((user) => {
        const tasks = uniqueTasks[user].map((task) => {
          return (
            <tr className={clsx("border")}>
              <td className={clsx("border")}>{user}</td>
              <td className={clsx("border")}>{task["Task Name"]}</td>
              <td className={clsx("border")}>
                {task["User Period Time Spent Text"]}
              </td>
              <td className={clsx("border")}>
                {task["User Period Time Spent"] / (1000 * 60 * 60)}
              </td>
            </tr>
          );
        });
        return tasks;
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
  const uniqTasksMappedByUsername = mapValues(groupedByUsername, (i) => {
    return uniqBy(i, (j) => j["Task Name"]);
  });
  return uniqTasksMappedByUsername;
}
