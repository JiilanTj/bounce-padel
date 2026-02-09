import { Popover, Transition } from '@headlessui/react';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';

type CalculatorState = {
    displayValue: string;
    previousValue: string | null;
    operator: string | null;
    waitingForNewValue: boolean;
};

export default function CalculatorWidget() {
    const [state, setState] = useState<CalculatorState>({
        displayValue: '0',
        previousValue: null,
        operator: null,
        waitingForNewValue: false,
    });

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('calculator_state');
        if (savedState) {
            setState(JSON.parse(savedState));
        }
    }, []);

    // Save state to localStorage on change
    useEffect(() => {
        localStorage.setItem('calculator_state', JSON.stringify(state));
    }, [state]);

    const inputDigit = (digit: string) => {
        const { displayValue, waitingForNewValue } = state;

        if (waitingForNewValue) {
            setState({
                ...state,
                displayValue: digit,
                waitingForNewValue: false,
            });
        } else {
            setState({
                ...state,
                displayValue:
                    displayValue === '0' ? digit : displayValue + digit,
            });
        }
    };

    const inputDecimal = () => {
        const { displayValue, waitingForNewValue } = state;

        if (waitingForNewValue) {
            setState({
                ...state,
                displayValue: '0.',
                waitingForNewValue: false,
            });
        } else if (displayValue.indexOf('.') === -1) {
            setState({
                ...state,
                displayValue: displayValue + '.',
            });
        }
    };

    const clear = () => {
        setState({
            displayValue: '0',
            previousValue: null,
            operator: null,
            waitingForNewValue: false,
        });
    };

    const performOperation = (nextOperator: string) => {
        const { displayValue, operator, previousValue } = state;
        const inputValue = parseFloat(displayValue);

        if (previousValue == null) {
            setState({
                ...state,
                previousValue: displayValue,
                waitingForNewValue: true,
                operator: nextOperator,
            });
        } else if (operator) {
            const currentValue = parseFloat(previousValue || '0');
            const newValue = calculate(currentValue, inputValue, operator);

            setState({
                displayValue: String(newValue),
                previousValue: String(newValue),
                waitingForNewValue: true,
                operator: nextOperator,
            });
        }
    };

    const calculate = (
        first: number,
        second: number,
        operator: string,
    ): number => {
        switch (operator) {
            case '+':
                return first + second;
            case '-':
                return first - second;
            case '*':
                return first * second;
            case '/':
                return first / second;
            default:
                return second;
        }
    };

    const handleEquals = () => {
        const { displayValue, operator, previousValue } = state;
        const inputValue = parseFloat(displayValue);

        if (!operator || previousValue == null) return;

        const currentValue = parseFloat(previousValue);
        const newValue = calculate(currentValue, inputValue, operator);

        setState({
            displayValue: String(newValue),
            previousValue: null,
            operator: null,
            waitingForNewValue: true,
        });
    };

    const handleDelete = () => {
        const { displayValue } = state;
        setState({
            ...state,
            displayValue:
                displayValue.length > 1
                    ? displayValue.substring(0, displayValue.length - 1)
                    : '0',
        });
    };

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button
                        className={`group inline-flex items-center rounded-xl p-2.5 text-gray-400 hover:text-gray-600 focus:outline-none ${open ? 'bg-gray-100 text-gray-600' : ''}`}
                        title="Kalkulator"
                    >
                        <CalculatorIcon className="h-5 w-5" />
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute right-0 z-50 mt-2 w-64 transform px-4 sm:px-0 lg:max-w-3xl">
                            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="relative bg-white p-4">
                                    {/* Display */}
                                    <div className="mb-4 flex flex-col justify-center rounded bg-gray-100 px-4 py-2 text-right">
                                        <div className="min-h-[1.5rem] text-sm text-gray-500">
                                            {state.previousValue}{' '}
                                            {state.operator}
                                        </div>
                                        <div className="text-2xl font-bold text-gray-800">
                                            {state.displayValue}
                                        </div>
                                    </div>

                                    {/* Keypad */}
                                    <div className="grid grid-cols-4 gap-2">
                                        <button
                                            onClick={clear}
                                            className="col-span-2 rounded bg-red-100 p-3 font-semibold text-red-600 hover:bg-red-200"
                                        >
                                            AC
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="rounded bg-gray-100 p-3 font-semibold text-gray-600 hover:bg-gray-200"
                                        >
                                            ⌫
                                        </button>
                                        <button
                                            onClick={() =>
                                                performOperation('/')
                                            }
                                            className="rounded bg-orange-100 p-3 font-semibold text-orange-600 hover:bg-orange-200"
                                        >
                                            ÷
                                        </button>

                                        <button
                                            onClick={() => inputDigit('7')}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            7
                                        </button>
                                        <button
                                            onClick={() => inputDigit('8')}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            8
                                        </button>
                                        <button
                                            onClick={() => inputDigit('9')}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            9
                                        </button>
                                        <button
                                            onClick={() =>
                                                performOperation('*')
                                            }
                                            className="rounded bg-orange-100 p-3 font-semibold text-orange-600 hover:bg-orange-200"
                                        >
                                            ×
                                        </button>

                                        <button
                                            onClick={() => inputDigit('4')}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            4
                                        </button>
                                        <button
                                            onClick={() => inputDigit('5')}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            5
                                        </button>
                                        <button
                                            onClick={() => inputDigit('6')}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            6
                                        </button>
                                        <button
                                            onClick={() =>
                                                performOperation('-')
                                            }
                                            className="rounded bg-orange-100 p-3 font-semibold text-orange-600 hover:bg-orange-200"
                                        >
                                            -
                                        </button>

                                        <button
                                            onClick={() => inputDigit('1')}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            1
                                        </button>
                                        <button
                                            onClick={() => inputDigit('2')}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            2
                                        </button>
                                        <button
                                            onClick={() => inputDigit('3')}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            3
                                        </button>
                                        <button
                                            onClick={() =>
                                                performOperation('+')
                                            }
                                            className="rounded bg-orange-100 p-3 font-semibold text-orange-600 hover:bg-orange-200"
                                        >
                                            +
                                        </button>

                                        <button
                                            onClick={() => inputDigit('0')}
                                            className="col-span-2 rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            0
                                        </button>
                                        <button
                                            onClick={inputDecimal}
                                            className="rounded bg-gray-50 p-3 font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            .
                                        </button>
                                        <button
                                            onClick={handleEquals}
                                            className="rounded bg-blue-500 p-3 font-semibold text-white hover:bg-blue-600"
                                        >
                                            =
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}
