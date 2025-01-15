/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import useCalculateTotals, { TotalsActionType } from "../useCalculateTotals";

describe("useCalculateTotals", () => {
  it("returns the initial state with subtotal, totalTax, and total set to 0", () => {
    const { result } = renderHook(() => useCalculateTotals());
    expect(result.current.state).toEqual({
      subtotal: 0,
      totalTax: 0,
      total: 0,
    });
  });

  it("updates the state when the subtotal is set", () => {
    const { result } = renderHook(() => useCalculateTotals());
    act(() => {
      result.current.dispatch({
        type: TotalsActionType.SET_SUBTOTAL,
        payload: 100,
      });
    });
    expect(result.current.state).toEqual({
      subtotal: 100,
      totalTax: 19,
      total: 119,
    });
  });

  it("updates the state when the subtotal is set with a decimal value", () => {
    const { result } = renderHook(() => useCalculateTotals());
    act(() => {
      result.current.dispatch({
        type: TotalsActionType.SET_SUBTOTAL,
        payload: 100.99,
      });
    });
    expect(result.current.state).toEqual({
      subtotal: 100.99,
      totalTax: 19.09,
      total: 120.08,
    });
  });

  it("does not update the state when an invalid action is dispatched", () => {
    const { result } = renderHook(() => useCalculateTotals());
    act(() => {
      result.current.dispatch({
        type: undefined as unknown as TotalsActionType,
        payload: 100,
      });
    });
    expect(result.current.state).toEqual({
      subtotal: 0,
      totalTax: 0,
      total: 0,
    });
  });
});
