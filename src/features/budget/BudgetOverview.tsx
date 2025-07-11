import React, {useMemo} from 'react';
import {BudgetPost, Envelope, Transaction} from "@/model";
import {formatEnvelope, getExpenses} from "@/utility/datautils";
import useFormatCurrency from "@/hooks/FormatCurrency";

interface Props {
    budgetPosts: BudgetPost[];
    budgetEnvelopes: Envelope[];
    budgetSelectedTransactions: Transaction[];
    groupByPost: (transactions: Transaction[]) => Partial<Record<BudgetPost['title'], Transaction[]>>;
    getTransactionPost: (transaction: Transaction) => BudgetPost | undefined;
}

const BudgetOverview = ({
                            budgetPosts,
                            budgetEnvelopes,
                            budgetSelectedTransactions,
                            groupByPost,
                            getTransactionPost
                        }: Props) => {
    const budgetPostGroups = useMemo(() => {
        return groupByPost(budgetSelectedTransactions);
    }, [budgetSelectedTransactions, groupByPost]);

    const formatCurrency = useFormatCurrency();

    const transactionsByEnvelope = useMemo(() => {
        const envelopeMap: Partial<Record<Envelope, Transaction[]>> = {};
        budgetEnvelopes.forEach(env => {
            envelopeMap[env] = [];
        });
        budgetSelectedTransactions.forEach(tran => {
            if (envelopeMap[tran.envelope]) {
                envelopeMap[tran.envelope]!.push(tran);
            }
        });
        return envelopeMap;
    }, [budgetSelectedTransactions, budgetEnvelopes]);

    const netByEnvelopeByPost = useMemo(() => {
        const netMap: Partial<Record<Envelope, Partial<Record<BudgetPost['title'], number>>>> = {};
        budgetEnvelopes.forEach(env => {
            netMap[env] = {};
            budgetPosts.forEach(post => {
                netMap[env]![post.title] = post.amount;
            });
        });

        getExpenses(budgetSelectedTransactions).forEach(tran => {
            const post = getTransactionPost(tran);
            if (post && netMap[tran.envelope]) {
                netMap[tran.envelope]![post.title]! += tran.amountAfterRefund;
            }
        });

        return netMap;
    }, [budgetSelectedTransactions, budgetEnvelopes, budgetPosts, getTransactionPost]);

    const netByEnvelope = useMemo(() => {
        const netMap: Partial<Record<Envelope, number>> = {};
        budgetEnvelopes.forEach(env => {
            netMap[env] = 0;
        });

        budgetEnvelopes.forEach(env => {
            const byPost = netByEnvelopeByPost[env];
            if (byPost) {
                Object.values(byPost).forEach(amount => {
                    netMap[env]! += amount ?? 0;
                });
            }
        })

        return netMap;
    }, [budgetEnvelopes, netByEnvelopeByPost]);

    return (
        <>
            {budgetPosts.length === 0 ? (
                <p className="text-gray-400">No budget posts yet.</p>
            ) : (
                <>
                    {/* Net for all posts, envelope dots summary */}
                    <div className="flex gap-2 mb-4">
                        {budgetEnvelopes.map((env, idx) => {
                            const net = netByEnvelope[env] ?? 0;
                            const color = net >= 0 ? 'bg-green-500' : 'bg-red-500';
                            return (
                                <span
                                    key={env}
                                    className={`inline-block w-3 h-3 rounded-full ${color}`}
                                    title={`Envelope: ${formatEnvelope(env)}, Net: ${formatCurrency(net)}`}
                                />
                            );
                        })}
                    </div>
                    <ul className="divide-y divide-gray-700">
                        {budgetPosts.map((post, index) => {
                            const numberOfEnvelopes = budgetEnvelopes.length;
                            const budgetedAmount = post.amount * numberOfEnvelopes;
                            const postExpenses = budgetPostGroups[post.title] || [];
                            const totalPostExpenses = postExpenses.reduce((sum, tran) => sum + tran.amountAfterRefund, 0);
                            const isOverBudget = totalPostExpenses > budgetedAmount;
                            const formattedAmount = formatCurrency(budgetedAmount);
                            const formattedTotal = formatCurrency(totalPostExpenses);
                            const difference = budgetedAmount + totalPostExpenses;
                            return (
                                <li key={index} className="py-2 flex flex-col gap-1">
                                    <div className="flex justify-between items-center">
                                        <div className={"flex flex-col gap-2"}>
                                            <p className="text-gray-200">{post.title}</p>

                                            {/* Dots for each envelope for this post, below the title */}
                                            <div className="flex gap-1 mb-1 ml-1">
                                                {budgetEnvelopes.map((env) => {
                                                    const net = netByEnvelopeByPost[env]?.[post.title] ?? 0;
                                                    const color = net >= 0 ? 'bg-green-500' : 'bg-red-500';
                                                    return (
                                                        <span
                                                            key={env}
                                                            className={`inline-block w-3 h-3 rounded-full ${color}`}
                                                            title={`Envelope: ${formatEnvelope(env)}, Post: ${post.title}, Net: ${formatCurrency(net)}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <p className={`font-mono ${isOverBudget ? "text-red-400" : "text-green-400"}`}>{formattedAmount}</p>
                                            <p>{formattedTotal}</p>
                                            <p className={`font-mono ${difference < 0 ? "text-red-400" : "text-green-400"}`}>{formatCurrency(difference)}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </>
    );
};

export default BudgetOverview;