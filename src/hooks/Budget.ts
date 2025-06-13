import {useEffect, useState} from "react";
import {BudgetPost} from "@/model";
import {getBudgetPostData} from "@/data";

const useBudget = () => {
    const [budgetPosts, setBudgetPosts] = useState<BudgetPost[]>([])

    useEffect(() => {
        const loaded = getBudgetPostData().load();
        setBudgetPosts(loaded);
    }, []);

    const saveBudgetPosts = (posts: BudgetPost[]) => {
        setBudgetPosts(getBudgetPostData().save(Array.from(new Set(posts))));
    }

    return {
        budgetPosts,
        createBudgetPost: (post: BudgetPost) => {
            saveBudgetPosts([...budgetPosts, post])
        },
        deleteBudgetPost: (post: BudgetPost) => {
            saveBudgetPosts([...budgetPosts].filter(e => e !== post))
        }
    };
};

export default useBudget;