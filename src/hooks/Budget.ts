import {useEffect, useState} from "react";
import {BudgetPost, Category, CategoryBudgetPostMap} from "@/model";
import {getBudgetPostData, getCategoryBudgetMapData} from "@/data";

const useBudget = () => {
    const [budgetPosts, setBudgetPosts] = useState<BudgetPost[]>([])
    const [categoryBudgetMap, setCategoryBudgetMap] = useState<CategoryBudgetPostMap>({})

    useEffect(() => {
        setBudgetPosts(getBudgetPostData().load());
        setCategoryBudgetMap(getCategoryBudgetMapData().load())
    }, []);

    const saveBudgetPosts = (posts: BudgetPost[]) => {
        setBudgetPosts(getBudgetPostData().save(Array.from(new Set(posts))));
    }

    const saveCategoryBudgetPostMapping = (mapping: CategoryBudgetPostMap) => {
        setCategoryBudgetMap(getCategoryBudgetMapData().save(mapping));
    }

    const removeCategoryBudgetMapping = (category: Category) => {
        const newState = {...categoryBudgetMap}
        delete newState[category];
        saveCategoryBudgetPostMapping(newState)
    };

    const getBudgetPostForCategory = (category: Category): BudgetPost | undefined => {
        const mappedTitle = categoryBudgetMap[category];
        if (!mappedTitle) return undefined;
        return budgetPosts.find(e => e.title === mappedTitle);
    }

    const getCategoriesForPost = (post: BudgetPost): Category[] => {
        const categories: Category[] = []
        Object.keys(categoryBudgetMap).forEach(cat => {
            if (categoryBudgetMap[cat] === post.title) {
                categories.push(cat)
            }
        })
        return categories;
    }

    return {
        budgetPosts,
        createBudgetPost: (post: BudgetPost) => {
            saveBudgetPosts([...budgetPosts, post])
        },
        setBudgetPosts: (posts: BudgetPost[]) => {
            saveBudgetPosts(posts);
            saveCategoryBudgetPostMapping({});
        },
        deleteBudgetPost: (post: BudgetPost) => {
            saveBudgetPosts([...budgetPosts].filter(e => e !== post))
            // Delete any mappings using the post
            const newMap = {...categoryBudgetMap};
            Object.keys(newMap).forEach(cat => {
                const mapping = newMap[cat];
                if (mapping === post.title) {
                    delete newMap[cat];
                }
            })
            saveCategoryBudgetPostMapping(newMap)
        },
        saveBudgetPosts,
        categoryBudgetMap,
        removeCategoryBudgetMapping,
        setCategoryBudgetMapping: (category: Category, budgetPost: BudgetPost | undefined) => {
            if (!budgetPost) return removeCategoryBudgetMapping(category);
            if (budgetPost.title === "" || budgetPost.title === undefined) {
                return removeCategoryBudgetMapping(category);
            }
            const newState = {...categoryBudgetMap}
            newState[category] = budgetPost.title;
            saveCategoryBudgetPostMapping(newState);
        },
        setCategoryBudgetMap: (map: CategoryBudgetPostMap) => {
            saveCategoryBudgetPostMapping(map);
        },
        getBudgetPostForCategory,
        getCategoriesForPost
    };
};

export default useBudget;