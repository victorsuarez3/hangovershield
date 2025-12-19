/**
 * Recovery Trend Line Chart - Hangover Shield
 * Simple line chart component for displaying 7-day recovery trends
 * Uses SVG for clean, scalable rendering
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 80; // Account for padding
const CHART_HEIGHT = 180;
const CHART_PADDING = 20;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RecoveryTrendDataPoint {
  day: string; // "Thu", "Fri", etc.
  value: number; // 0-100 recovery score
  date: string; // "YYYY-MM-DD"
}

interface RecoveryTrendLineChartProps {
  data: RecoveryTrendDataPoint[];
  interpretation?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const RecoveryTrendLineChart: React.FC<RecoveryTrendLineChartProps> = ({
  data,
  interpretation,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate chart dimensions
  const chartInnerWidth = CHART_WIDTH - CHART_PADDING * 2;
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING * 2;

  // Normalize values to 0-100 range
  const minValue = 0;
  const maxValue = 100;
  const valueRange = maxValue - minValue;

  // Calculate points for the line
  const points = data.map((point, index) => {
    const x = CHART_PADDING + (index / (data.length - 1)) * chartInnerWidth;
    // Invert Y so higher values appear higher (SVG Y increases downward)
    const normalizedValue = (point.value - minValue) / valueRange;
    const y = CHART_HEIGHT - CHART_PADDING - normalizedValue * chartInnerHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Grid lines (subtle) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = CHART_PADDING + ratio * chartInnerHeight;
            return (
              <Line
                key={`grid-${ratio}`}
                x1={CHART_PADDING}
                y1={y}
                x2={CHART_WIDTH - CHART_PADDING}
                y2={y}
                stroke="rgba(15, 76, 68, 0.05)"
                strokeWidth={1}
              />
            );
          })}

          {/* Main trend line */}
          <Polyline
            points={points}
            fill="none"
            stroke="#0F4C44"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = CHART_PADDING + (index / (data.length - 1)) * chartInnerWidth;
            const normalizedValue = (point.value - minValue) / valueRange;
            const y = CHART_HEIGHT - CHART_PADDING - normalizedValue * chartInnerHeight;
            
            return (
              <Circle
                key={`point-${index}`}
                cx={x}
                cy={y}
                r={6}
                fill="#0F4C44"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            );
          })}
        </Svg>
      </View>

      {/* Day labels */}
      <View style={styles.dayLabelsContainer}>
        {data.map((point, index) => (
          <Text key={`label-${index}`} style={styles.dayLabel}>
            {point.day}
          </Text>
        ))}
      </View>

      {/* Human interpretation */}
      {interpretation && (
        <Text style={styles.interpretation}>{interpretation}</Text>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dayLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CHART_PADDING,
    marginTop: 8,
  },
  dayLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.5)',
    textAlign: 'center',
  },
  interpretation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
});

export default RecoveryTrendLineChart;

