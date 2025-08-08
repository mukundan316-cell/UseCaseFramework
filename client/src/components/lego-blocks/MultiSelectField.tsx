import { Label } from "@/components/ui/label";

interface MultiSelectFieldProps {
  label: string;
  items: string[];
  selectedItems: string[];
  onSelectionChange: (newItems: string[]) => void;
  singleValue?: string;
  onSingleValueChange?: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

/**
 * LEGO Block: Multi-Select Field Component
 * Reusable component for both single-select and multi-select functionality
 * Supports backward compatibility with single-value fields
 */
export default function MultiSelectField({
  label,
  items,
  selectedItems,
  onSelectionChange,
  singleValue,
  onSingleValueChange,
  placeholder = `Select ${label.toLowerCase()}...`,
  helpText,
  className = ""
}: MultiSelectFieldProps) {
  
  const handleCheckboxChange = (item: string, isChecked: boolean) => {
    let newItems: string[];
    if (isChecked) {
      newItems = [...selectedItems, item];
    } else {
      newItems = selectedItems.filter(i => i !== item);
    }
    onSelectionChange(newItems);
    
    // Update single value for backward compatibility
    if (onSingleValueChange) {
      if (newItems.length > 0) {
        onSingleValueChange(newItems[0]);
      } else {
        onSingleValueChange('');
      }
    }
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1 p-3 border rounded-md max-h-32 overflow-y-auto bg-white">
        {items.filter(item => item && item.trim()).length === 0 ? (
          <p className="text-sm text-gray-500 italic">{placeholder}</p>
        ) : (
          items.filter(item => item && item.trim()).map(item => {
            const isChecked = selectedItems.includes(item);
            
            return (
              <div key={item} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id={`${label.toLowerCase().replace(/\s+/g, '-')}-${item}`}
                  checked={isChecked}
                  onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label 
                  htmlFor={`${label.toLowerCase().replace(/\s+/g, '-')}-${item}`} 
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {item}
                </label>
              </div>
            );
          })
        )}
      </div>
      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
}