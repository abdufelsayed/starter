import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { type ItemInstance } from "@headless-tree/core";
import { MinusIcon, PlusIcon, ChevronDownIcon } from "lucide-react";
import { createContext, useContext } from "react";

import { cn } from "@starter/ui/lib/utils";

type ToggleIconType = "chevron" | "plus-minus";

type TreeContextItem = Pick<ItemInstance<unknown>, "isExpanded" | "isFolder" | "getItemName">;

interface TreeContextValue {
  indent: number;
  currentItem?: TreeContextItem;
  tree?: any;
  toggleIconType?: ToggleIconType;
}

const TreeContext = createContext<TreeContextValue>({
  indent: 20,
  currentItem: undefined,
  tree: undefined,
  toggleIconType: "plus-minus",
});

function useTreeContext() {
  return useContext(TreeContext);
}

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
  indent?: number;
  tree?: any;
  toggleIconType?: ToggleIconType;
}

function Tree({ indent = 20, tree, className, toggleIconType = "chevron", ...props }: TreeProps) {
  const containerProps =
    tree && typeof tree.getContainerProps === "function" ? tree.getContainerProps() : {};
  const mergedProps = { ...props, ...containerProps };

  // Extract style from mergedProps to merge with our custom styles
  const { style: propStyle, ...otherProps } = mergedProps;

  // Merge styles
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const mergedStyle = {
    ...propStyle,
    "--tree-indent": `${indent}px`,
  } as React.CSSProperties;

  return (
    <TreeContext.Provider value={{ indent, tree, toggleIconType }}>
      <div
        data-slot="tree"
        style={mergedStyle}
        className={cn("flex flex-col", className)}
        {...otherProps}
      />
    </TreeContext.Provider>
  );
}

interface TreeItemProps<T = unknown> extends Omit<useRender.ComponentProps<"button">, "indent"> {
  item: ItemInstance<T>;
  indent?: number;
}

function TreeItem<T = unknown>({ item, className, render, children, ...props }: TreeItemProps<T>) {
  const parentContext = useTreeContext();
  const { indent } = parentContext;

  const itemProps = typeof item.getProps === "function" ? item.getProps() : {};
  const mergedProps = { ...props, children, ...itemProps };

  // Extract style from mergedProps to merge with our custom styles
  const { style: propStyle, ...otherProps } = mergedProps;

  // Merge styles
  const mergedStyle = {
    ...propStyle,
    "--tree-padding": `${item.getItemMeta().level * indent}px`,
  } as React.CSSProperties;

  const defaultProps = {
    "data-slot": "tree-item",
    style: mergedStyle,
    className: cn(
      "z-10 ps-(--tree-padding) outline-hidden select-none not-last:pb-0.5 focus:z-20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    ),
    "data-focus": typeof item.isFocused === "function" ? item.isFocused() || false : undefined,
    "data-folder": typeof item.isFolder === "function" ? item.isFolder() || false : undefined,
    "data-selected": typeof item.isSelected === "function" ? item.isSelected() || false : undefined,
    "data-drag-target":
      typeof item.isDragTarget === "function" ? item.isDragTarget() || false : undefined,
    "data-search-match":
      typeof item.isMatchingSearch === "function" ? item.isMatchingSearch() || false : undefined,
    "aria-expanded": item.isExpanded(),
  };

  return (
    <TreeContext.Provider value={{ ...parentContext, currentItem: item }}>
      {useRender({
        defaultTagName: "button",
        render,
        props: mergeProps<"button">(defaultProps, otherProps),
      })}
    </TreeContext.Provider>
  );
}

interface TreeItemLabelProps<T = unknown> extends React.HTMLAttributes<HTMLSpanElement> {
  item?: ItemInstance<T>;
}

function TreeItemLabel<T = unknown>({
  item: propItem,
  children,
  className,
  ...props
}: TreeItemLabelProps<T>) {
  const { currentItem, toggleIconType } = useTreeContext();
  const item = propItem || currentItem;

  if (!item) {
    console.warn("TreeItemLabel: No item provided via props or context");
    return null;
  }

  return (
    <span
      data-slot="tree-item-label"
      className={cn(
        "flex items-center gap-1 bg-background transition-colors not-in-data-[folder=true]:ps-7 hover:bg-accent in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50 in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-blue-50! in-data-[selected=true]:bg-accent in-data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "rounded-sm",
        "py-1.5",
        "px-2",
        "text-sm",
        className,
      )}
      {...props}
    >
      {item.isFolder() &&
        (toggleIconType === "plus-minus" ? (
          item.isExpanded() ? (
            <MinusIcon
              className="size-3.5 text-muted-foreground"
              stroke="currentColor"
              strokeWidth="1"
            />
          ) : (
            <PlusIcon
              className="size-3.5 text-muted-foreground"
              stroke="currentColor"
              strokeWidth="1"
            />
          )
        ) : (
          <ChevronDownIcon className="size-4 text-muted-foreground in-aria-[expanded=false]:-rotate-90" />
        ))}
      {children || (typeof item.getItemName === "function" ? item.getItemName() : null)}
    </span>
  );
}

function TreeDragLine({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { tree } = useTreeContext();

  if (!tree || typeof tree.getDragLineStyle !== "function") {
    console.warn(
      "TreeDragLine: No tree provided via context or tree does not have getDragLineStyle method",
    );
    return null;
  }

  const dragLine = tree.getDragLineStyle();
  return (
    <div
      style={dragLine}
      className={cn(
        "absolute z-30 -mt-px h-0.5 w-[unset] bg-primary before:absolute before:start-0 before:-top-0.75 before:size-2 before:border-2 before:border-primary before:bg-background",
        "before:rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Tree, TreeItem, TreeItemLabel, TreeDragLine };
