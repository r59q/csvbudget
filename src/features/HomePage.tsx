import React from 'react';
import {LinkButton} from "@/components/LinkButton";
import {FaChartBar, FaFileCsv, FaWallet} from "react-icons/fa";
import {MdOutlinePrivacyTip} from "react-icons/md";

const subsections = [
    {
        title: "Import Your CSVs",
        text: "Easily import your transactions in form of CSV files. This tool helps you convert your data to a financial overview.",
        icon: <FaFileCsv size={64} className="text-blue-400"/>,
        imgRight: false,
    },
    {
        title: "Visualize Your Finances",
        text: "See your income, expenses, and trends with clear charts and summaries. Get instant insights into your spending habits.",
        icon: <FaChartBar size={64} className="text-green-400"/>,
        imgRight: true,
    },
    {
        title: "Set Budgets & Goals",
        text: "Create envelopes, set monthly budgets, and track your progress. Stay on top of your financial goals with ease.",
        icon: <FaWallet size={64} className="text-purple-400"/>,
        imgRight: false,
    },
    {
        title: "100% Private By Design",
        text: "Your data never leaves your device. CSV Budget uses no cloud infrastructure, no tracking, and stores all data securely in your browser's local storage. Enjoy full privacy and peace of mind.",
        icon: <MdOutlinePrivacyTip size={64} className="text-green-300"/>,
        imgRight: true,
    },
];
const HomePage = () => {
    return <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-950 to-[#0a0a0a]">
        {/* Top Section */}
        <section
            className="relative bg-gradient-to-b from-gray-900 to-gray-950 p-8 sm:p-16 flex flex-col justify-end h-[220px] sm:h-[260px] w-full">
            <div className="max-w-4xl mx-auto w-full">
                <h1 className="text-3xl sm:text-5xl font-bold mb-2 text-gray-100">
                    CSV Budget
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 max-w-2xl">
                    A simple, privacy-friendly way to analyze your finances from CSV files.
                </p>
            </div>
            <div
                className="flex justify-end max-w-4xl mx-auto w-full mt-4 absolute left-1/2 -translate-x-1/2 bottom-6">
                <LinkButton href={"/import"}>Get Started</LinkButton>
            </div>
        </section>

        {/* Main Section */}
        <main className="flex-1 flex flex-col gap-16 py-12 mb-2 px-4 max-w-4xl mx-auto w-full rounded-xl">
            {subsections.map((section, idx) => (
                <div
                    key={section.title}
                    className={`flex flex-col sm:flex-row items-center gap-8 ${
                        section.imgRight ? "sm:flex-row-reverse" : ""
                    }`}>
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold mb-2 text-gray-100">
                            {section.title}
                        </h2>
                        <p className="text-gray-300 text-base sm:text-lg">
                            {section.text}
                        </p>
                    </div>
                    <div className="flex-1 flex justify-center">
                        {section.icon}
                    </div>
                </div>
            ))}
        </main>
    </div>;
};

export default HomePage;