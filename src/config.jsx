const spreadsheet_id = "1l6qj5TbRJcQxL056W474bOYdgH_NDlgQ7xeW_-pT-zg";
const spreadsheet_base_url = `https://docs.google.com/spreadsheets/d/${spreadsheet_id}/gviz/tq?tqx=out:csv`;
const sheet_url = (sheetName) => `${spreadsheet_base_url}&sheet=${encodeURIComponent(sheetName)}`;

export const hash_url = sheet_url("App Config");
export const data_url = `${sheet_url("Accounts")}&headers=0`;
export const loan_summary_url = sheet_url("Loan Summary");
export const loan_history_url = sheet_url("Payment History");
export const goals_url = sheet_url("Goals");
