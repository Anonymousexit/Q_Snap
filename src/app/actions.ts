"use server";

import {
  correctUserEdits,
  type CorrectUserEditsOutput,
} from "@/ai/flows/correct-user-edits";
import {
  extractTextFromImage,
  type ExtractTextFromImageOutput,
} from "@/ai/flows/extract-text-flow";

export async function validateUserEdits(
  originalText: string,
  editedText: string
): Promise<CorrectUserEditsOutput> {
  if (originalText.trim() === editedText.trim()) {
    return {
      isValid: true,
      validationReason:
        "No changes detected. The text is the same as the original.",
    };
  }

  if (!editedText.trim()) {
    return {
        isValid: false,
        validationReason: "The text cannot be empty.",
    };
  }

  try {
    const result = await correctUserEdits({ originalText, editedText });
    return result;
  } catch (error) {
    console.error("Error validating user edits:", error);
    // Return a generic error to the client
    return {
      isValid: false,
      validationReason:
        "An unexpected error occurred while validating the edits. Please try again.",
    };
  }
}

export async function extractText(
  photoDataUri: string
): Promise<ExtractTextFromImageOutput> {
  try {
    const result = await extractTextFromImage({ photoDataUri });
    return result;
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error("An unexpected error occurred while extracting the text.");
  }
}
