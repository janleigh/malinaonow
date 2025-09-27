import { TranslationContext } from "@/shared/context/TranslationContext";
import { useContext } from "react";

export const useTranslation = () => useContext(TranslationContext);
