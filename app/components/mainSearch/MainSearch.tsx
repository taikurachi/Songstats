import Image from "next/image";
type MainSearchProps = {
  searchString: string;
  setSearchString: (value: string | ((prev: string) => string)) => void;
};
export default function MainSearch({
  searchString,
  setSearchString,
}: MainSearchProps) {
  return (
    <main className="h-[calc(100svh-110px)] flex items-center justify-center flex-col gap-10 mt-[-55px]">
      <h1 className="text-4xl font-bold">Explore Song Data</h1>
      <div className="flex gap-3 bg-white pl-10 pr-10 pt-8 pb-8 rounded-[30px]">
        <Image
          className=""
          src="/search-icon.svg"
          width={30}
          height={30}
          alt="search icon"
        />
        <input
          onChange={(e) => setSearchString(e.target.value)}
          value={searchString}
          type="text"
          className=" text-black border-none outline-none w-4/5 sm:w-[400px]"
          placeholder="Search"
        />
      </div>
      <p>
        Recommended: <span className="ml-4">Sienna</span>{" "}
        <span className="ml-4">Die For You</span>{" "}
        <span className="ml-4">Blessed</span>
      </p>
    </main>
  );
}
