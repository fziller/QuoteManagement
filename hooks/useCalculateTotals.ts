import { GERMAN_TAX } from "@/types/constant";
import { useReducer } from "react";

const initialState = {
  subtotal: 0,
  totalTax: 0,
  total: 0,
};

interface TotalsState {
  subtotal: number;
  totalTax: number;
  total: number;
}

interface TotalsAction {
  type: TotalsActionType;
  payload: number;
}

export enum TotalsActionType {
  SET_SUBTOTAL = "SET_SUBTOTAL",
  SET_TOTAL_TAX = "SET_TOTAL_TAX",
  SET_TOTAL = "SET_TOTAL",
}

const useCalculateTotals = () => {
  const reducer = (state: TotalsState, action: TotalsAction) => {
    switch (action.type) {
      case TotalsActionType.SET_SUBTOTAL:
        return {
          ...state,
          subtotal: Number(action.payload.toFixed(2)),
          totalTax: Number((action.payload * GERMAN_TAX).toFixed(2)),
          total: Number(
            (
              action.payload + Number((action.payload * GERMAN_TAX).toFixed(2))
            ).toFixed(2)
          ),
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return { dispatch, TotalsActionType, state };
};

export default useCalculateTotals;
