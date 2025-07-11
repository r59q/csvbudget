import { useEffect, useState } from "react";
import { getCurrencyData } from "@/data";

const useCurrency = () => {
    const [currency, setCurrencyState] = useState<string>("EUR");

    useEffect(() => {
        const currencyData = getCurrencyData();
        setCurrencyState(currencyData.load());
    }, []);

    const setCurrency = (newCurrency: string) => {
        setCurrencyState(getCurrencyData().save(newCurrency));
    };

    return { currency, setCurrency };
};

export default useCurrency;
