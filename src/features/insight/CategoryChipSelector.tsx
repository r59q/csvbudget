import React from "react";
import Chip from "@/components/Chip";

interface CategoryChipSelectorProps {
    categories: string[];
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
}

const CategoryChipSelector = ({
    categories,
    selectedCategories,
    setSelectedCategories
}: CategoryChipSelectorProps) => {
    return (
        <div className={"flex flex-wrap gap-2 pb-2"}>
            {categories.map((category) => (
                <Chip
                    key={category}
                    label={category}
                    selected={selectedCategories.includes(category)}
                    onClick={() => {
                        if (selectedCategories.includes(category)) {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                        } else {
                            setSelectedCategories([...selectedCategories, category]);
                        }
                    }}
                />
            ))}
        </div>
    );
};

export default CategoryChipSelector;

