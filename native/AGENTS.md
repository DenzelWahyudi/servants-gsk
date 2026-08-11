# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

# Review Before Changes

Before making ANY changes (file edits, running commands, creating files, deleting files, or any other modifications), you MUST:
1. Summarize the planned changes clearly.
2. Ask the user explicitly for approval.
3. Only proceed after receiving explicit confirmation.

# Styling: NativeWind First

This project uses **NativeWind** for styling. Always use `className` props with Tailwind utility classes.
Do NOT replace NativeWind `className` styling with React Native `StyleSheet` objects.
Only use `StyleSheet` as a last resort for properties that NativeWind cannot express (e.g., native-only shadow tokens).
