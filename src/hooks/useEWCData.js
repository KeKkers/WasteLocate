import { useState, useEffect } from 'react';

export function useEWCData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedSubchapter, setSelectedSubchapter] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [finalSelection, setFinalSelection] = useState(null);

  const loadEWCData = async () => {
    try {
      const response = await fetch('/ewc_hierarchy.json');
      const parsed = await response.json();
      console.log('EWC Data loaded:', parsed);
      console.log('Number of chapters:', Object.keys(parsed).length);
      setData(parsed);
      setLoading(false);
    } catch (err) {
      console.error('Error loading EWC data:', err);
      alert('Failed to load EWC data. Please check if ewc_hierarchy.json is in the public folder.');
      setLoading(false);
    }
  };

  const getChapters = () => {
    if (!data) return [];
    return Object.keys(data)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => ({ code: key, description: data[key].description }));
  };

  const getSubchapters = () => {
    if (!selectedChapter || !data?.[selectedChapter]?.subchapters) return [];
    const subchapters = data[selectedChapter].subchapters;
    return Object.keys(subchapters)
      .sort((a, b) => a.localeCompare(b))
      .map(key => ({ code: key, name: subchapters[key].name }));
  };

  const getCodes = () => {
    if (!selectedChapter || !selectedSubchapter || !data?.[selectedChapter]?.subchapters?.[selectedSubchapter]?.codes) return [];
    const codes = data[selectedChapter].subchapters[selectedSubchapter].codes;
    return Object.keys(codes).map(key => ({ code: key, description: codes[key] }));
  };

  const isHazardous = (description) => {
    if (!description) return false;
    const desc = description.toUpperCase();
    return desc.includes(' MH') || desc.includes(' AH') ||
      desc.includes('MH ') || desc.includes('AH ') ||
      desc.endsWith('MH') || desc.endsWith('AH');
  };

  // Keyword search across entire EWC hierarchy
  // Returns up to `limit` results sorted by relevance
  const searchEWCCodes = (query, limit = 20) => {
    if (!data || !query || query.trim().length < 2) return [];

    const q = query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(t => t.length > 1);
    const results = [];

    for (const chapterKey of Object.keys(data)) {
      const chapter = data[chapterKey];
      const chapterDesc = (chapter.description || '').toLowerCase();

      for (const subKey of Object.keys(chapter.subchapters || {})) {
        const sub = chapter.subchapters[subKey];
        const subName = (sub.name || '').toLowerCase();

        for (const codeKey of Object.keys(sub.codes || {})) {
          const codeDesc = (sub.codes[codeKey] || '').toLowerCase();
          const fullText = `${codeKey} ${codeDesc} ${subName} ${chapterDesc}`;

          // Score: exact code match = highest, then term matches
          let score = 0;

          // Direct EWC code match
          if (codeKey.startsWith(q)) score += 100;
          if (codeKey === q) score += 200;

          // Score each search term
          for (const term of terms) {
            if (codeDesc.includes(term)) score += 20;
            if (subName.includes(term)) score += 10;
            if (chapterDesc.includes(term)) score += 5;
            // Bonus for term appearing near start of description
            if (codeDesc.startsWith(term)) score += 15;
          }

          // All terms present = bonus
          if (terms.every(t => fullText.includes(t))) score += 30;

          if (score > 0) {
            results.push({
              code: codeKey,
              description: sub.codes[codeKey],
              chapterKey,
              chapterDesc: chapter.description,
              subKey,
              subName: sub.name,
              score,
            });
          }
        }
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  // When a search result is selected, populate the cascade dropdowns
  const selectFromSearch = (result, setFacilities) => {
    setSelectedChapter(result.chapterKey);
    setSelectedSubchapter(result.subKey);
    setSelectedCode(result.code);
    setFinalSelection({ code: result.code, description: result.description });
    if (setFacilities) setFacilities([]);
  };

  const resetSelection = () => {
    setSelectedChapter('');
    setSelectedSubchapter('');
    setSelectedCode('');
    setFinalSelection(null);
  };

  useEffect(() => {
    loadEWCData();
  }, []);

  return {
    data,
    loading,
    selectedChapter, setSelectedChapter,
    selectedSubchapter, setSelectedSubchapter,
    selectedCode, setSelectedCode,
    finalSelection, setFinalSelection,
    getChapters,
    getSubchapters,
    getCodes,
    isHazardous,
    resetSelection,
    searchEWCCodes,
    selectFromSearch,
  };
}
