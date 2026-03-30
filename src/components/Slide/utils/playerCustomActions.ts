import React from "react";

export const toPlayerCustomActionList = (customActions?: React.ReactNode) =>
  React.Children.toArray(customActions);

export const getPlayerCustomActionCount = (customActions?: React.ReactNode) =>
  toPlayerCustomActionList(customActions).length;
