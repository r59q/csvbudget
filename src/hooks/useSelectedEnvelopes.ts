import { useState, useEffect } from "react";
import { Envelope } from "@/model";
import { getSelectedEnvelopesData } from "@/data";

export default function useSelectedEnvelopes() {
    const [selectedEnvelopes, setSelectedEnvelopes] = useState<Envelope[]>([]);

    useEffect(() => {
        setSelectedEnvelopes(getSelectedEnvelopesData().load());
    }, []);

    const saveSelectedEnvelopes = (envelopes: Envelope[]) => {
        setSelectedEnvelopes(getSelectedEnvelopesData().save(envelopes));
    };

    const toggleSelectedEnvelope = (envelope: Envelope) => {
        setSelectedEnvelopes(prev => {
            const newEnvelopes = prev.includes(envelope)
                ? prev.filter(e => e !== envelope)
                : [...prev, envelope];
            return getSelectedEnvelopesData().save(newEnvelopes);
        });
    };

    const isEnvelopeSelected = (envelope: Envelope) => {
        return selectedEnvelopes.includes(envelope);
    };

    return {
        selectedEnvelopes,
        saveSelectedEnvelopes,
        toggleSelectedEnvelope,
        isEnvelopeSelected,
    };
}

