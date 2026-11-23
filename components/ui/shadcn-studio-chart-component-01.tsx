'use client'

import * as React from 'react'
import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar'
import { Bar, BarChart, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DefaultTooltipContentProps, TooltipValueType } from 'recharts'

import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type IconComponent = React.ComponentType<{ className?: string }>

export interface SalesMetric {
  icon: IconComponent
  title: string
  value: string
}

export interface RevenueSlice {
  /** Unique id, also used as the chart colour key. */
  id: string
  label: string
  value: number
  /** Percentage (0-100) of the primary colour used for the slice. Defaults by position: 100, 60, 20. */
  strength?: number
}

export interface SalesCompany {
  name: string
  email: string
  logoSrc?: string
}

export interface CohortIndicator {
  icon: IconComponent
  label: string
}

export interface SalesMetricsCardProps {
  title?: string
  company?: SalesCompany
  metrics?: SalesMetric[]
  revenueTitle?: string
  revenueSlices?: RevenueSlice[]
  /** Value shown in the centre of the donut chart. */
  revenueTotal?: string
  revenueTotalLabel?: string
  planCompletedLabel?: string
  /** Plan completion in percent (0-100). */
  planCompleted?: number
  salesPlanTitle?: string
  /** Sales plan progress in percent (0-100), drives the bar chart. */
  salesPlanPercentage?: number
  salesPlanCaption?: string
  cohortTitle?: string
  cohortDescription?: string
  cohortIndicators?: CohortIndicator[]
  className?: string
}

type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>

/* -------------------------------------------------------------------------- */
/*                                 UI primitives                              */
/* -------------------------------------------------------------------------- */

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card'
      className={cn(
        'group/card bg-card text-card-foreground ring-foreground/10 flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-sm ring-1 [--card-spacing:--spacing(4)]',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-header'
      className={cn('group/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing)', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 data-slot='card-title' className={cn('text-base leading-snug font-medium', className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='card-content' className={cn('px-(--card-spacing)', className)} {...props} />
}

function Avatar({ className, ...props }: AvatarPrimitive.Root.Props) {
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      className={cn(
        'group/avatar after:border-border relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:mix-blend-darken dark:after:mix-blend-lighten',
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn('bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm', className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                Chart helpers                               */
/* -------------------------------------------------------------------------- */

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error('useChart must be used within a <ChartContainer />')
  return context
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, item]) => item.color)
  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {
${colorConfig.map(([key, item]) => `  --color-${key}: ${item.color};`).join('\n')}
}`
      }}
    />
  )
}

function ChartContainer({
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<typeof ResponsiveContainer>['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot='chart'
        data-chart={chartId}
        className={cn(
          'flex aspect-video justify-center text-sm [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden',
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer initialDimension={{ width: 320, height: 200 }}>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltipContent({
  active,
  payload,
  className,
  hideLabel = false,
  label,
  nameKey
}: React.ComponentProps<typeof Tooltip> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean
    nameKey?: string
  } & Omit<DefaultTooltipContentProps<TooltipValueType, number | string>, 'accessibilityLayer'>) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  return (
    <div
      className={cn(
        'border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm shadow-xl',
        className
      )}
    >
      {!hideLabel && typeof label === 'string' && label && (
        <div className='font-medium'>{config[label]?.label ?? label}</div>
      )}
      <div className='grid gap-1.5'>
        {payload
          .filter(item => item.type !== 'none')
          .map((item, index) => {
            const key = String(nameKey ?? item.name ?? item.dataKey ?? 'value')
            const itemConfig = config[key]
            const indicatorColor = item.payload?.fill ?? item.color

            return (
              <div key={index} className='flex w-full flex-wrap items-center gap-2'>
                <div
                  className='h-2.5 w-2.5 shrink-0 rounded-[2px]'
                  style={{ backgroundColor: indicatorColor, borderColor: indicatorColor }}
                />
                <div className='flex flex-1 items-center justify-between leading-none'>
                  <span className='text-muted-foreground'>{itemConfig?.label ?? item.name}</span>
                  {item.value != null && (
                    <span className='text-foreground font-mono font-medium tabular-nums'>
                      {typeof item.value === 'number' ? item.value.toLocaleString() : String(item.value)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Block                                   */
/* -------------------------------------------------------------------------- */

const TOTAL_BARS = 24
const DEFAULT_STRENGTHS = [100, 60, 20, 10]

const SalesMetricsCard = ({
  title = 'Sales metrics',
  company,
  metrics = [],
  revenueTitle = 'Revenue goal',
  revenueSlices = [],
  revenueTotal = '',
  revenueTotalLabel = 'Total Profit',
  planCompletedLabel = 'Plan completed',
  planCompleted = 0,
  salesPlanTitle = 'Sales plan',
  salesPlanPercentage = 0,
  salesPlanCaption = 'Percentage profit from total sales',
  cohortTitle = 'Cohort analysis indicators',
  cohortDescription = '',
  cohortIndicators = [],
  className
}: SalesMetricsCardProps) => {
  const filledBars = Math.round((salesPlanPercentage * TOTAL_BARS) / 100)

  const salesChartData = React.useMemo(
    () => Array.from({ length: TOTAL_BARS }, (_, index) => ({ index, sales: index < filledBars ? 315 : 0.0001 })),
    [filledBars]
  )

  const salesChartConfig: ChartConfig = { sales: { label: 'Sales' } }

  const revenueChartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = { sales: { label: 'Sales' } }
    revenueSlices.forEach((slice, index) => {
      const strength = slice.strength ?? DEFAULT_STRENGTHS[index] ?? 10
      config[slice.id] = {
        label: slice.label,
        color:
          strength >= 100
            ? 'var(--color-primary)'
            : `color-mix(in oklab, var(--color-primary) ${strength}%, transparent)`
      }
    })
    return config
  }, [revenueSlices])

  const revenueChartData = revenueSlices.map(slice => ({
    month: slice.id,
    sales: slice.value,
    fill: `var(--color-${slice.id})`
  }))

  return (
    <Card className={className}>
      <CardContent>
        <div className='grid gap-6 lg:grid-cols-5'>
          <div className='flex flex-col justify-between gap-7 lg:col-span-3'>
            <h2 className='text-xl font-semibold'>{title}</h2>

            {company && (
              <div className='flex items-center gap-3'>
                {company.logoSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoSrc} className='size-10.5 rounded-lg' alt={`${company.name} logo`} />
                )}
                <div className='flex flex-col gap-0.5'>
                  <span className='text-xl font-medium'>{company.name}</span>
                  <span className='text-muted-foreground text-sm'>{company.email}</span>
                </div>
              </div>
            )}

            <ul className='grid gap-4 sm:grid-cols-2'>
              {metrics.map(metric => (
                <li key={metric.title}>
                  <Card className='ring-foreground/10 py-2 shadow-none ring-1'>
                    <CardContent className='flex items-center gap-3 px-4'>
                      <Avatar className='rounded-sm after:border-0'>
                        <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-sm'>
                          <metric.icon className='size-5' />
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col gap-0.5'>
                        <span className='text-muted-foreground text-sm font-medium'>{metric.title}</span>
                        <span className='text-xl font-medium'>{metric.value}</span>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>

          <Card className='ring-foreground/10 justify-between gap-4 shadow-none ring-1 lg:col-span-2'>
            <CardHeader className='gap-1'>
              <CardTitle className='text-xl font-semibold'>{revenueTitle}</CardTitle>
            </CardHeader>

            <CardContent className='space-y-4'>
              <ChartContainer
                config={revenueChartConfig}
                className='h-38.5 w-full'
                role='img'
                aria-label={`${revenueTitle}: ${revenueSlices.map(slice => `${slice.label} ${slice.value}`).join(', ')}`}
              >
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={revenueChartData}
                    dataKey='sales'
                    nameKey='month'
                    startAngle={300}
                    endAngle={660}
                    innerRadius={58}
                    outerRadius={75}
                    paddingAngle={2}
                    stroke='none'
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 12}
                                className='fill-card-foreground text-xl font-medium'
                              >
                                {revenueTotal}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 19} className='fill-muted-foreground text-sm'>
                                {revenueTotalLabel}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className='flex items-center justify-between'>
                <span className='text-xl'>{planCompletedLabel}</span>
                <span className='text-2xl font-medium'>{planCompleted}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>

      <CardContent>
        <Card className='ring-foreground/10 shadow-none ring-1'>
          <CardContent className='grid gap-4 lg:grid-cols-5'>
            <div className='flex flex-col justify-center gap-6'>
              <h3 className='text-xl font-semibold'>{salesPlanTitle}</h3>
              <span className='text-6xl'>{salesPlanPercentage}%</span>
              <span className='text-muted-foreground text-sm'>{salesPlanCaption}</span>
            </div>
            <div className='flex flex-col gap-6 text-xl md:col-span-4'>
              <h3 className='font-medium'>{cohortTitle}</h3>
              <p className='text-muted-foreground text-wrap'>{cohortDescription}</p>
              <ul className='grid gap-6 md:grid-cols-2'>
                {cohortIndicators.map(indicator => (
                  <li key={indicator.label} className='flex items-center gap-2'>
                    <indicator.icon className='size-6' />
                    <span className='text-xl font-medium'>{indicator.label}</span>
                  </li>
                ))}
              </ul>

              <ChartContainer
                config={salesChartConfig}
                className='h-7.75 w-full'
                role='img'
                aria-label={`${salesPlanTitle}: ${salesPlanPercentage}% complete`}
              >
                <BarChart data={salesChartData} margin={{ left: 0, right: 0 }} maxBarSize={16}>
                  <Bar
                    dataKey='sales'
                    fill='var(--color-primary)'
                    background={{ fill: 'color-mix(in oklab, var(--color-primary) 10%, transparent)', radius: 12 }}
                    radius={12}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default SalesMetricsCard
