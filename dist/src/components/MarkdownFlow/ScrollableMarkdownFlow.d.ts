import { default as React } from 'react';
import { MarkdownFlowProps } from './MarkdownFlow';
interface ScrollableMarkdownFlowProps extends MarkdownFlowProps {
    height?: string | number;
    className?: string;
}
declare const ScrollableMarkdownFlow: React.FC<ScrollableMarkdownFlowProps>;
export default ScrollableMarkdownFlow;
