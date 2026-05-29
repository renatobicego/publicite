"use client";
import { useCreateAdWizard } from "./useCreateAdWizard";
import { WizardStep } from "./types";
import PostTypeStep from "./steps/PostTypeStep";
import BehaviourTypeStep from "./steps/BehaviourTypeStep";
import TitleStep from "./steps/TitleStep";
import DescriptionStep from "./steps/DescriptionStep";
import PriceStep from "./steps/PriceStep";
import ConditionStep from "./steps/ConditionStep";
import PetitionTypeStep from "./steps/PetitionTypeStep";
import CategoryStep from "./steps/CategoryStep";
import LocationStep from "./steps/LocationStep";
import ImagesStep from "./steps/ImagesStep";
import SummaryStep from "./steps/SummaryStep";

export { useCreateAdWizard };
export type { WizardStep };

interface StepRendererProps {
    step: WizardStep;
    wizard: ReturnType<typeof useCreateAdWizard>;
    onSubmitAd: () => void;
    isSubmitting: boolean;
}

/**
 * Renders the current active step's interactive component.
 * This is placed at the bottom of the chat messages area.
 */
export function ActiveStepInput({
    step,
    wizard,
    onSubmitAd,
    isSubmitting,
}: StepRendererProps) {
    switch (step) {
        case "postType":
            return <PostTypeStep onSelect={wizard.setPostType} />;
        case "behaviourType":
            return <BehaviourTypeStep onSelect={wizard.setBehaviourType} />;
        case "title":
            return <TitleStep onSubmit={wizard.setTitle} />;
        case "description":
            return <DescriptionStep onSubmit={wizard.setDescription} />;
        case "price":
            return (
                <PriceStep
                    postType={wizard.data.postType!}
                    onSubmit={wizard.setPrice}
                />
            );
        case "condition":
            return <ConditionStep onSelect={wizard.setCondition} />;
        case "petitionType":
            return <PetitionTypeStep onSelect={wizard.setPetitionType} />;
        case "category":
            return <CategoryStep onSelect={wizard.setCategory} />;
        case "location":
            return <LocationStep onSubmit={wizard.setLocation} />;
        case "images":
            return <ImagesStep onSubmit={wizard.setImages} />;
        case "summary":
            return (
                <SummaryStep
                    data={wizard.data}
                    onConfirm={onSubmitAd}
                    onCancel={wizard.cancelWizard}
                    isSubmitting={isSubmitting}
                />
            );
        default:
            return null;
    }
}
