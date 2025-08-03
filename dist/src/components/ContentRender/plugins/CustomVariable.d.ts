import { default as React } from 'react';
import { Components } from 'react-markdown';
import { OnSendContentParams } from '../../types';
interface CustomVariableNode {
    tagName: 'custom-variable';
    properties?: {
        variableName?: string;
        buttonTexts?: string[];
        placeholder?: string;
    };
}
interface CustomVariableProps {
    node: CustomVariableNode;
    defaultButtonText?: string;
    defaultInputText?: string;
    readonly?: boolean;
    onSend?: (content: OnSendContentParams) => void;
}
interface ComponentsWithCustomVariable extends Components {
    'custom-variable': React.ComponentType<CustomVariableProps>;
}
declare const CustomButtonInputVariable: ({ node, readonly, defaultButtonText, defaultInputText, onSend }: CustomVariableProps) => React.JSX.Element;
export default CustomButtonInputVariable;
export type { CustomVariableProps, CustomVariableNode, ComponentsWithCustomVariable };
