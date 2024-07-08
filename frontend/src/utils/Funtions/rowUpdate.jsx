import axios from "axios";
import newRequest from "../userRequest";
import { toast } from "react-toastify";
import { gtrackUrl } from "../config";

function computeMutation(newRow, oldRow) {
  for (let key in newRow) {
    if (newRow[key] !== oldRow[key]) {
      return true;
    }
  }
  return false;

}


function computeOdooRowMutation(newRow, oldRow) {
  let changed = false;
  let changedColumns = {};

  for (let key in newRow) {
    console.log(`Comparing ${key}: newRow[${key}] = ${newRow[key]}, oldRow[${key}] = ${oldRow[key]}`);
    if (newRow[key] !== oldRow[key]) {
      changed = true;
      changedColumns[key] = newRow[key];
    }
  }

  return { changed, changedColumns };
}




export const UpdateRowData = (newRow, oldRow, openSnackbar, endPoint, type) => {
  console.log("newRow: ", newRow);

  return new Promise((resolve, reject) => {
    const ifUpdates = computeMutation(newRow, oldRow); // check if there is any change in the row
    if (!ifUpdates) {
      resolve(oldRow);
      console.log("nothing changed");
      return;
    }

    let requestPromise;
    if (type === "formData") {
      const formData = new FormData();

      for (const key in newRow) {
        if (
          key === "logo" &&
          newRow[key] === null &&
          newRow["logoUpdated"] === true
        ) {
          // If logo is null and logoUpdated is true, continue without appending
          continue;
        } else if (key === "logo") {
          formData.append(key, newRow[key].file);
        } else if (key !== "logoUpdated") {
          // Append all other fields except logoUpdated
          formData.append(key, newRow[key]);
        }
      }
      // requestPromise = newRequest.put(endPoint, formData, {
      requestPromise = axios.put(gtrackUrl + endPoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      requestPromise = newRequest.put(endPoint, newRow);
    }

    requestPromise
      .then((res) => {
        console.log(res);
        resolve(newRow);
        console.log("updated");
        // openSnackbar(res?.data?.message ?? "data updated", "success");
        toast.success(res?.data?.message ?? "data updated");
      })
      .catch((err) => {
        console.log(err);
        resolve(oldRow);
        console.log("not updated");
        // use toast here
        toast.error(
          err?.response?.data?.message ?? "something went wrong!"

        );
      });
  });
};

export const UpdateRowDataWithDoc = (
  newRow,
  oldRow,
  openSnackbar,
  endPoint,
  type
) => {
  console.log("newRow: ", newRow);

  return new Promise((resolve, reject) => {
    const ifUpdates = computeMutation(newRow, oldRow); // check if there is any change in the row
    if (!ifUpdates) {
      resolve(oldRow);
      console.log("nothing changed");
      return;
    }

    let requestPromise;
    if (type === "formData") {
      const formData = new FormData();

      for (const key in newRow) {
        if (
          key === "PdfDoc" &&
          newRow[key] === null &&
          newRow["logoUpdated"] === true
        ) {
          // If logo is null and logoUpdated is true, continue without appending
          continue;
        } else if (key === "PdfDoc") {
          formData.append(key, newRow[key].file);
          console.log("newRow[key].file", newRow[key].file);
        } else if (key !== "logoUpdated") {
          // Append all other fields except logoUpdated
          formData.append(key, newRow[key]);
          console.log(key, newRow[key]);
        }
      }
      requestPromise = newRequest.put(endPoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      requestPromise = newRequest.put(endPoint, newRow);
    }

    requestPromise
      .then((res) => {
        console.log(res);
        resolve(newRow);
        console.log("updated");
        // openSnackbar(res?.data?.message ?? "data updated", "success");
        toast.success(res?.data?.message ?? "data updated");
      })
      .catch((err) => {
        console.log(err);
        resolve(oldRow);
        console.log("not updated");
        // openSnackbar(
        //   err?.response?.data?.message ?? "something went wrong!",
        //   "error"
        // );
        toast.error(
          err?.response?.data?.message ?? "something went wrong!"

        );
      });
  });
};


export const UpdateOdooErpRowData = (newRow, oldRow, openSnackbar, endPoint, odooId) => {
  console.log(oldRow, newRow);

  return new Promise((resolve, reject) => {
    const RowComparsionResult = computeOdooRowMutation(newRow, oldRow); // check if there is any change in the row
    console.log(RowComparsionResult);
    if (RowComparsionResult.changed === false) {
      resolve(oldRow);
      console.log("nothing changed");
      return;
    }

    let requestPromise;
    const data = { id: odooId, recordId: newRow?.id, updatedData: RowComparsionResult.changedColumns }
    console.log(data);

    requestPromise = newRequest.put(endPoint, data);

    requestPromise
      .then((res) => {
        console.log(res);
        resolve(newRow);
        console.log("updated");
        openSnackbar(res?.data?.message ?? "data updated", "success");
      })
      .catch((err) => {
        console.log(err);
        resolve(oldRow);
        openSnackbar(
          err?.response?.data?.message ?? "something went wrong!",
          "error"
        );
      });
  });
};