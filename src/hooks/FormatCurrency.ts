import {useGlobalContext} from "@/context/GlobalContext";
import {useCallback} from "react";

const useFormatCurrency = () => {
    const {currency} = useGlobalContext();
    return useCallback((amount: number) =>
        amount.toLocaleString("da-DK", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
        }), [currency]);
};

export default useFormatCurrency;