import { default as React } from 'react';
import { Components } from 'react-markdown';
import { OnSendContentParams } from '../../types';
interface CustomButtonNode {
    type: 'element';
    tagName: 'custom-button';
    properties?: {
        buttonText?: string;
    };
}
type CustomButtonProps = {
    node: CustomButtonNode;
    readonly?: boolean;
    defaultButtonText?: string;
    onSend?: (content: OnSendContentParams) => void;
};
interface ComponentsWithCustomButton extends Components {
    'custom-button': React.ComponentType<CustomButtonProps>;
}
declare const CustomButton: ({ node, readonly, defaultButtonText, onSend }: CustomButtonProps) => React.JSX.Element;
export default CustomButton;
export type { CustomButtonProps, CustomButtonNode, ComponentsWithCustomButton };
