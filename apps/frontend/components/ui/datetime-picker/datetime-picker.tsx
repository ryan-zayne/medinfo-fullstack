import { useControllableState } from "@zayne-labs/toolkit-react";
import { format } from "date-fns";
import { ForWithWrapper, IconBox } from "@/components/common";
import { cnJoin, cnMerge } from "@/lib/utils/cn";
import { buttonVariants } from "../button";
import { Calendar, CalendarDayButton } from "../calender";
import { shadcnButtonVariants } from "../constants";
import * as Popover from "../popover";
import { ScrollArea } from "../scroll-area";
import { getDateFromString } from "./getDateFromString";

type DatePickerProps = {
	className?: string;
	dateString?: string;
	defaultDateString?: string;
	formats?: {
		onChangeDate?: string;
		visibleDate?: string;
	};
	onDateStringChange?: (dateString?: string) => void;
	placeholder?: string;
	variant?: "date" | "datetime" | "time";
};

export function DateTimePicker(props: DatePickerProps) {
	const {
		className,
		dateString: dateStringProp,
		defaultDateString: defaultDateStringProp = "",
		formats,
		onDateStringChange: onDateStringChangeProp,
		placeholder,
		variant = "date",
	} = props;

	const [dateString, setDateString] = useControllableState({
		defaultProp: defaultDateStringProp,
		isControlled: "dateString" in props,
		onChange: onDateStringChangeProp,
		prop: dateStringProp,
	});

	const date = getDateFromString(dateString);

	const showTimePicker = variant === "time" || variant === "datetime";

	const showDatePicker = variant === "date" || variant === "datetime";

	return (
		<Popover.Root>
			<Popover.Trigger asChild={true}>
				<button
					type="button"
					className={cnMerge(
						buttonVariants({ theme: "primary-inverse", withInteractions: true }),
						"w-full justify-between text-[14px] text-medinfo-body-color md:w-full",
						className
					)}
				>
					<span className={cnJoin(!date && "text-medinfo-dark-4")}>
						{date ? format(date, formats?.visibleDate ?? "PPP") : placeholder}
					</span>

					<IconBox icon="solar:calendar-outline" className="size-5" />
				</button>
			</Popover.Trigger>

			<Popover.Content className="w-auto border-none p-0">
				<div className="flex rounded-[10px] border-[1.4px] border-medinfo-primary-main">
					{showDatePicker && (
						<Calendar
							mode="single"
							captionLayout="dropdown"
							classNames={{
								button_next:
									"hover:bg-medinfo-primary-lighter hover:text-shadcn-primary-foreground",
								button_previous:
									"hover:bg-medinfo-primary-lighter hover:text-shadcn-primary-foreground",
								today: "bg-medinfo-primary-lighter",
							}}
							components={{
								// eslint-disable-next-line react-x/no-nested-component-definitions
								DayButton: ({ className: innerClassName, ...innerProps }) => (
									<CalendarDayButton
										className={cnMerge(
											`hover:bg-medinfo-primary-subtle hover:text-medinfo-body-color
											data-[selected-single=true]:bg-medinfo-primary-main`,
											innerClassName
										)}
										{...innerProps}
									/>
								),
							}}
							selected={date}
							onSelect={(selectedDate) => {
								if (!selectedDate) return;

								setDateString(format(selectedDate, formats?.onChangeDate ?? "MM-dd-yyyy"));
							}}
						/>
					)}

					{showTimePicker && (
						<TimeScrollArea
							dateValue={date ?? new Date()}
							onChange={setDateString as typeof onDateStringChangeProp}
							formats={formats}
						/>
					)}
				</div>
			</Popover.Content>
		</Popover.Root>
	);
}

type TimeScrollAreaProps = {
	dateValue: Date;
	formats: DatePickerProps["formats"];
	onChange: DatePickerProps["onDateStringChange"];
};

function TimeScrollArea(props: TimeScrollAreaProps) {
	const { dateValue, formats, onChange } = props;

	function handleTimeChange(variant: "am-pm" | "hour" | "minute", value: number | string) {
		const newDate = new Date(dateValue);

		switch (variant) {
			case "am-pm": {
				const hours = newDate.getHours();

				if (value === "AM" && hours >= 12) {
					newDate.setHours(hours - 12);
				}

				if (value === "PM" && hours < 12) {
					newDate.setHours(hours + 12);
				}
				break;
			}

			case "hour": {
				const hour = Number(value);

				// newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
				newDate.setHours(hour);
				break;
			}

			case "minute": {
				const minute = Number(value);

				newDate.setMinutes(minute);
				break;
			}

			default: {
				variant satisfies never;
			}
		}

		onChange?.(format(newDate, formats?.onChangeDate ?? "MM-dd-yyyy HH:mm:ss"));
	}
	return (
		<div className="flex h-[332px] divide-x divide-y-0 divide-medinfo-primary-main">
			<ScrollArea className="w-auto">
				<ForWithWrapper
					className="flex flex-col p-2"
					each={[...Array(24).keys()].toReversed()}
					renderItem={(hour) => (
						<button
							type="button"
							data-selected={dateValue.getHours() === hour}
							key={hour}
							className={cnMerge(
								"aspect-square shrink-0",
								shadcnButtonVariants({ size: "icon", variant: "ghost" }),
								`hover:bg-medinfo-primary-subtle hover:text-medinfo-body-color
								data-[selected=true]:bg-medinfo-primary-main
								data-[selected=true]:text-shadcn-primary-foreground`
							)}
							onClick={() => handleTimeChange("hour", hour)}
						>
							{hour}
						</button>
					)}
				/>
			</ScrollArea>

			<ScrollArea className="w-64 sm:w-auto">
				<ForWithWrapper
					as="div"
					className="flex flex-col p-2"
					each={[...Array(12).keys()].map((index) => index * 5)}
					renderItem={(minute) => (
						<button
							type="button"
							data-selected={dateValue.getMinutes() === minute}
							key={minute}
							className={cnMerge(
								"aspect-square shrink-0",
								shadcnButtonVariants({ size: "icon", variant: "ghost" }),
								`hover:bg-medinfo-primary-subtle hover:text-medinfo-body-color
								data-[selected=true]:bg-medinfo-primary-main
								data-[selected=true]:text-shadcn-primary-foreground`
							)}
							onClick={() => handleTimeChange("minute", minute)}
						>
							{minute}
						</button>
					)}
				/>
			</ScrollArea>

			{/*
			<ScrollArea>
				<ForWithWrapper
					as="div"
					className="flex flex-col p-2"
					each={["AM", "PM"]}
					renderItem={(am_pm) => (
						<button
							type="button"
							key={am_pm}
							data-selected={
								(am_pm === "AM" && dateValue.getHours() < 12)
								|| (am_pm === "PM" && dateValue.getHours() >= 12)
							}
							className={cnMerge(
								"aspect-square shrink-0",
								shadcnButtonVariants({
									size: "icon",
									variant: "ghost",
									className: `hover:bg-medinfo-primary-subtle hover:text-medinfo-body-color
									data-[selected=true]:bg-medinfo-primary-main
									data-[selected=true]:text-shadcn-primary-foreground`,
								})
							)}
							onClick={() => handleTimeChange("am-pm", am_pm)}
						>
							{am_pm}
						</button>
					)}
				/>
			</ScrollArea> */}
		</div>
	);
}
