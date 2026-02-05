// Color mapping for categories
export const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'Work': 'bg-blue-100 text-blue-800 border-blue-200',
    'Personal': 'bg-purple-100 text-purple-800 border-purple-200',
    'Important': 'bg-red-100 text-red-800 border-red-200',
  };

  // Default color for unknown categories
  const defaultColor = 'bg-gray-100 text-gray-800 border-gray-200';
  
  return colorMap[category] || defaultColor;
};

