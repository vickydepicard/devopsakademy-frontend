import { useState, useEffect } from 'react';

export const useDynamicApi = (serviceMethod, ...params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceMethod(...params);
      setData(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [...params]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  };
};

// Hook pour les mutations (POST, PUT, DELETE)
export const useDynamicMutation = (serviceMethod) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = async (...params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceMethod(...params);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    error,
    data,
    reset: () => {
      setError(null);
      setData(null);
    }
  };
};