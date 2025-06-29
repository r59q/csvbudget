import Link from 'next/link';
import React from 'react';

const TopBar: React.FC = () => (
    <div className={"border-solid border-b-2 border-gray-500 p-1 flex flex-row justify-between gap-2"}>
        <div className={"flex flex-grow"}>
            <Link className={"text-lg border-solid border-gray-500 border-2 px-2"} href={"/upload"}>Upload</Link>
            <Link className={"text-lg border-solid border-gray-500 border-2 px-2"} href={"/filter"}>Filter</Link>
            <Link className={"text-lg border-solid border-gray-500 border-2 px-2"} href={"/income"}>Income</Link>
            <Link className={"text-lg border-solid border-gray-500 border-2 px-2"} href={"/insight"}>Insight</Link>
            <Link className={"text-lg border-solid border-gray-500 border-2 px-2"} href={"/budget"}>Budget</Link>
        </div>
        <div className={"flex"}>
            <Link className={"text-lg border-solid border-gray-500 border-2 px-2"} href={"/reset"}>Reset</Link>
        </div>
    </div>
);

export default TopBar;

