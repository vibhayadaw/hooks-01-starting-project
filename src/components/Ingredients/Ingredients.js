import React, {useReducer, useEffect, useCallback, useMemo} from 'react';
import IngredientList from './IngredientList';
import IngredientForm from './IngredientForm';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
};

function Ingredients() {
  const [userIngredients, dispatch] = useReducer (ingredientReducer, []);
  const {isLoading, error, data, sendRequest, reqExtra, reqIdentifier, clear } =useHttp();

  useEffect ( () => {
    if(!isLoading && reqIdentifier === 'REMOVE_INGREDIENT'){
      dispatch ({type: 'DELETE', id:reqExtra})
    }
    else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT'){
      dispatch({
        type:'ADD',
        ingredient: {id: data.name, ...reqExtra}
      })
    }
    
  }, [data, error, isLoading, reqExtra, reqIdentifier]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({
      type: 'SET',
      ingredients:filteredIngredients
    });
  }, [])

  const addIngredientHandler = useCallback(ingredient =>{

    sendRequest(
      'https://react-hooks-update-290a4.firebaseio.com/ingredients.json',
      'POST',
      JSON.stringify(ingredient),
      null,
      'ADD_INGREDIENT'
    );
  },[sendRequest]);

  const removeIngredientHandler = useCallback(ingredientId => {
    sendRequest(
      `https://react-hooks-update-290a4.firebaseio.com/ingredients/${ingredientId}.json`, 
      'DELETE',
      null,
      ingredientId,
      'REMOVE_INGREDIENT'
      );
  }, [sendRequest]);
  
  const ingredientList = useMemo(() => {
    return ( <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>);
  }, [userIngredients, removeIngredientHandler])

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}> {error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
};

export default Ingredients;
