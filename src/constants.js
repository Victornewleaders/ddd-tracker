// ── DDD Brand Tokens ─────────────────────────────────────────────────────
export const C = {
  teal: "#00838F", tealDk: "#005662", tealLt: "#E0F4F4", tealMd: "#4DB6AC",
  green: "#4CAF50", greenDk: "#2E7D32", greenLt: "#E8F5E9",
  orange: "#F57C00", orangeLt: "#FFF3E0",
  navy: "#1A2332", navyMd: "#243447",
  white: "#FFFFFF", off: "#F7F9FC",
  grey: "#607D8B", greyLt: "#ECEFF1", greyDk: "#37474F",
  red: "#E53935", redLt: "#FFEBEE",
  blue: "#1565C0", blueLt: "#E3F2FD",
  purple: "#6A1B9A", purpleLt: "#F3E5F5",
};

export const STAGE_C = {
  Planning: { bg: C.blueLt, fg: C.blue },
  Active: { bg: C.greenLt, fg: C.greenDk },
  Paused: { bg: C.orangeLt, fg: C.orange },
  Completed: { bg: C.greyLt, fg: C.grey },
  Cancelled: { bg: C.redLt, fg: C.red },
};

export const TYPE_C = {
  "Underperforming School": { bg: C.redLt, fg: C.red },
  "DBE Mentorship": { bg: C.blueLt, fg: C.blue },
  "District Support": { bg: C.tealLt, fg: C.tealDk },
  "GET Phase": { bg: C.purpleLt, fg: C.purple },
  "Reading Literacy": { bg: C.orangeLt, fg: C.orange },
};

export const PROVINCES = ["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","North West","Northern Cape","Western Cape"];

export const DISTRICTS = {
  "Eastern Cape": ["Alfred Nzo East","Alfred Nzo West","Amathole East","Amathole West","Buffalo City","Chris Hani East","Chris Hani West","Joe Gqabi","Nelson Mandela Metro","OR Tambo Coastal","OR Tambo Inland","Sarah Baartman"],
  "Free State": ["Fezile Dabi","Lejweleputswa","Motheo","Thabo Mofutsanyana","Xhariep"],
  "Gauteng": ["Ekurhuleni North","Ekurhuleni South","Gauteng East","Gauteng North","Gauteng West","Johannesburg Central","Johannesburg East","Johannesburg North","Johannesburg South","Johannesburg West","Sedibeng East","Sedibeng West","Tshwane North","Tshwane South","Tshwane West"],
  "KwaZulu-Natal": ["Amajuba","Harry Gwala","iLembe","King Cetshwayo","Pinetown","Ugu","Umgungundlovu","Umkhanyakude","Umlazi","Umzinyathi","Uthukela","Zululand"],
  "Limpopo": ["Capricorn North","Capricorn South","Mopani East","Mopani West","Sekhukhune East","Sekhukhune South","Vhembe East","Vhembe West","Waterberg"],
  "Mpumalanga": ["Bohlabela","Ehlanzeni","Gert Sibande","Nkangala"],
  "North West": ["Bojanala","Dr Kenneth Kaunda","Dr Ruth Segomotsi Mompati","Ngaka Modiri Molema"],
  "Northern Cape": ["Frances Baard","John Taolo Gaetsewe","Namakwa","Pixley Ka Seme","ZF Mgcawu"],
  "Western Cape": ["Cape Winelands","Eden & Central Karoo","Metro Central","Metro East","Metro North","Metro South","Overberg","West Coast"],
};

export const INT_TYPES = ["Underperforming School","DBE Mentorship","District Support","GET Phase","Reading Literacy"];
export const STAGES = ["Planning","Active","Paused","Completed","Cancelled"];
export const GRADES = ["Foundation","Intermediate","Senior","FET","GET & FET","All Grades","Grade 4-7","Grade 7-9","Grade 10-12","Grade 12"];
export const SUBJECTS = ["All","Mathematics","Languages","LOLT","Natural Sciences","All FET subjects","Languages & Mathematics"];
export const PHASES_LIST = ["Foundation","Intermediary","Senior","Senior & FET","FET","GET","GET & FET","All"];
export const LEVELS = ["School","Circuit","District","Province"];
export const CONFIDENCE = ["Low","Medium","High"];
export const ACTION_STATUS = ["Planned","In Progress","Completed","Blocked"];
export const DDD_TOOLS = ["FET Profiling Tool","Learner Charts","School Dashboard","District Dashboard","Subject Analysis","Attendance Tracker","Provincial Overview","Circular D3 Reports","Custom Analysis"];
