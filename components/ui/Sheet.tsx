import React, { useCallback, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextProps, ViewProps } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '@/lib/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SheetRef {
  open: () => void;
  close: () => void;
}

export interface SheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  scrollable?: boolean;
}

// ─── Sheet (imperative ref API) ───────────────────────────────────────────────

export const Sheet = forwardRef<SheetRef, SheetProps>(
  ({ children, snapPoints, enableDynamicSizing = true, scrollable = false }, ref) => {
    const sheetRef = useRef<BottomSheet>(null);

    const resolvedSnapPoints = useMemo(
      () => snapPoints ?? ['50%', '90%'],
      [snapPoints],
    );

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
    }));

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.75}
        />
      ),
      [],
    );

    const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={enableDynamicSizing ? undefined : resolvedSnapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <ContentWrapper style={styles.contentWrapper}>
          {children}
        </ContentWrapper>
      </BottomSheet>
    );
  },
);

Sheet.displayName = 'Sheet';

// ─── Declarative open/close API ───────────────────────────────────────────────

interface SheetControlledProps extends SheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SheetControlled({ isOpen, onClose, children, snapPoints, scrollable }: SheetControlledProps) {
  const ref = useRef<SheetRef>(null);

  React.useEffect(() => {
    if (isOpen) ref.current?.open();
    else ref.current?.close();
  }, [isOpen]);

  return (
    <Sheet ref={ref} snapPoints={snapPoints} scrollable={scrollable} enableDynamicSizing={!snapPoints}>
      {children}
    </Sheet>
  );
}

// ─── Sub-components (match web Sheet API) ────────────────────────────────────

export function SheetHeader({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

interface SheetTitleProps extends TextProps {
  onClose?: () => void;
}

export function SheetTitle({ style, children, onClose, ...props }: SheetTitleProps) {
  return (
    <View style={styles.titleRow}>
      <Text style={[styles.title, style]} {...props}>
        {children}
      </Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function SheetDescription({ style, children, ...props }: TextProps) {
  return (
    <Text style={[styles.description, style]} {...props}>
      {children}
    </Text>
  );
}

export function SheetContent({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.body, style]} {...props}>
      {children}
    </View>
  );
}

export function SheetFooter({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  handle: {
    backgroundColor: colors.border,
    width: 36,
    height: 4,
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  description: {
    fontSize: typography.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.base,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.md,
  },
});
