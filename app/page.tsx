"use client";
import { useState } from "react";
import Header from "./components/utils/Header";
import MainSearch from "./components/mainSearch/MainSearch";
export default function Home() {
  const [searchString, setSearchString] = useState<string>("");
  return (
    <>
      <Header />
      <MainSearch
        searchString={searchString}
        setSearchString={setSearchString}
      />
    </>
  );
}
