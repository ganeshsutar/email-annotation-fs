import { Paintbrush, RotateCcw, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useTheme,
  NeutralColor,
  BaseColor,
  StylePreset,
  ThemeMode,
  RADIUS_OPTIONS,
  NEUTRAL_SWATCH_COLORS,
  BASE_SWATCH_COLORS,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const NEUTRAL_OPTIONS = Object.values(NeutralColor);
const BASE_OPTIONS = Object.values(BaseColor);
const STYLE_OPTIONS = Object.values(StylePreset);

export function ThemeCustomizer() {
  const {
    config,
    setStyle,
    setNeutralColor,
    setBaseColor,
    setRadius,
    setMode,
    resetTheme,
  } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">Customize theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Customize</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={resetTheme}
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>

          {/* Style */}
          <div className="space-y-1.5">
            <Label className="text-xs">Style</Label>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  onClick={() => setStyle(style)}
                  className={cn(
                    "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                    config.style === style
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Neutral Color */}
          <div className="space-y-1.5">
            <Label className="text-xs">Neutral Color</Label>
            <div className="flex gap-2">
              {NEUTRAL_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNeutralColor(color)}
                  className={cn(
                    "flex flex-col items-center gap-1",
                  )}
                  title={color}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                      config.neutralColor === color
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/25"
                    )}
                  >
                    <span
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: NEUTRAL_SWATCH_COLORS[color] }}
                    />
                  </span>
                  <span className="text-[10px] capitalize text-muted-foreground">
                    {color}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Base Color */}
          <div className="space-y-1.5">
            <Label className="text-xs">Base Color</Label>
            <div className="flex flex-wrap gap-2">
              {BASE_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBaseColor(color)}
                  className={cn(
                    "flex flex-col items-center gap-1",
                  )}
                  title={color}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                      config.baseColor === color
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/25"
                    )}
                  >
                    <span
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: BASE_SWATCH_COLORS[color] }}
                    />
                  </span>
                  <span className="text-[10px] capitalize text-muted-foreground">
                    {color}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div className="space-y-1.5">
            <Label className="text-xs">Radius</Label>
            <ToggleGroup
              type="single"
              value={String(config.radius)}
              onValueChange={(value) => {
                if (value) setRadius(Number(value));
              }}
              className="flex-wrap justify-start gap-1"
            >
              {RADIUS_OPTIONS.map((r) => (
                <ToggleGroupItem
                  key={r}
                  value={String(r)}
                  className="h-7 px-2.5 text-xs"
                >
                  {r}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <Label className="text-xs">Mode</Label>
            <ToggleGroup
              type="single"
              value={config.mode}
              onValueChange={(value) => {
                if (value) setMode(value as ThemeMode);
              }}
              className="justify-start gap-1"
            >
              <ToggleGroupItem value="light" className="h-7 gap-1 px-2.5 text-xs">
                <Sun className="h-3.5 w-3.5" />
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" className="h-7 gap-1 px-2.5 text-xs">
                <Moon className="h-3.5 w-3.5" />
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="system" className="h-7 gap-1 px-2.5 text-xs">
                <Monitor className="h-3.5 w-3.5" />
                System
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
