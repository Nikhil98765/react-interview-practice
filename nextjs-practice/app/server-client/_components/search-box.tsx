"use client";

/* Client component. It still renders on the server first: DB_VAR logs its real value in the terminal and is empty in the browser (Gotcha 3). */

import { ChangeEvent, type ReactNode, useState } from "react";
import { Badge } from "./Badge"; // Badge doesn't have use client directive.

// import {getUsers } from '../_lib/db'; // unused: builds. Called (uncomment the useEffect too, and import useEffect): build error (Gotcha 4)

export const SearchBox = ({children}: {children: ReactNode, changeHandler?: (e: ChangeEvent) => void, prop1: string}) => {
  const [search, setSearch] = useState("");
  // console.log("🚀 ~ SearchBox ~ prop1:", prop1);
  console.log("🚀 ~ SearchBox ~ process.env.DB_VAR:", process.env.DB_VAR);
  console.log("🚀 ~ SearchBox ~ process.env.NEXT_PUBLIC_TEST1:", process.env.NEXT_PUBLIC_TEST1)
  // useEffect(() => { 
  //   getUsers();
  // }, []);

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          // changeHandler(e);
        }}
      />
      {children}
      <Badge />
    </>
  );
}