/**
 * Fitzy Coach Service
 * Returns a placeholder response. In production, this connects to a Supabase Edge Function.
 * No external AI API or keys are used here.
 */
export async function askCoach(message: string): Promise<string> {
  // Simulate short network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const lower = message.toLowerCase();

  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('train')) {
    return 'Focus on progressive overload: increase either your load by 2.5kg or add 1 rep while keeping form strict.';
  }

  if (lower.includes('protein') || lower.includes('food') || lower.includes('eat') || lower.includes('calorie')) {
    return 'Prioritize 1.8g to 2.2g of protein per kg of bodyweight spread across 3-4 balanced meals today.';
  }

  if (lower.includes('rest') || lower.includes('sleep') || lower.includes('recovery')) {
    return 'High-quality recovery happens during deep sleep. Aim for 7.5 to 8 hours and drink at least 2.5L of water.';
  }

  return 'Great consistency today! Keep tracking your sets and staying on target with your daily routine.';
}
