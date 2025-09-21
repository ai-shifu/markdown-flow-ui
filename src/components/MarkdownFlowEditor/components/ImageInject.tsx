/** inject image to mc-editor */
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

export type ImageResource = {
  resourceUrl: string;
  resourceTitle?: string;
};
export interface ImageInjectProps {
  value?: Partial<ImageResource>;
  onSelect: (resource: ImageResource) => void;
}

/**
 * Collects image URL/title to insert into the editor.
 * @example
 * <ImageInject onSelect={(r) => ...} />
 */
const ImageInject = React.forwardRef<HTMLDivElement, ImageInjectProps>(
  ({ value, onSelect }, ref) => {
    const [resource, setResource] = useState<ImageResource>({
      resourceUrl: value?.resourceUrl ?? "",
      resourceTitle: value?.resourceTitle ?? "",
    });

    const handleSelect = () => {
      onSelect({
        ...resource,
        resourceTitle: resource.resourceTitle || "Image name",
      });
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setResource((prev) => ({
        ...prev,
        resourceUrl: e.target.value,
      }));
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setResource((prev) => ({
        ...prev,
        resourceTitle: e.target.value,
      }));
    };

    return (
      <div ref={ref} className="space-y-4">
        <Input
          type="text"
          placeholder="Please enter image URL"
          value={resource.resourceUrl || ""}
          onChange={handleUrlChange}
        />
        <Input
          type="text"
          placeholder="Please enter image title"
          value={resource.resourceTitle || ""}
          onChange={handleTitleChange}
        />
        <div className="flex justify-end">
          <Button
            className="h-8"
            onClick={handleSelect}
            disabled={!resource?.resourceUrl}
            variant="outline"
          >
            Use Image
          </Button>
        </div>
      </div>
    );
  }
);

ImageInject.displayName = "ImageInject";

export default ImageInject;
