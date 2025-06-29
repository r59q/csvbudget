"use client";
import React, {PropsWithChildren} from 'react';
import {GlobalContextProvider} from "@/context/GlobalContext";
import TopBar from "@/features/TopBar";

const ContentRoot = ({children}: PropsWithChildren) => {
    return <GlobalContextProvider>
        <TopBar />
        {children}
    </GlobalContextProvider>;
};

export default ContentRoot;