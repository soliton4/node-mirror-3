import React, { useEffect, useRef, useState } from 'react';
import { useGlobal } from '../../GlobalContext';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { languages } from '@codemirror/language-data';

// Sorted list of languages by name
const sortedLanguages = [...languages].sort((a, b) =>
  a.name.localeCompare(b.name)
);

//console.log(sortedLanguages);

export default function ReactCodeMirrorEditor({ valuePar, onChangePar, fileExtension, setToolbarExtras }) {
  const wrapperRef = useRef(null);

  const { state } = useGlobal();
  const darkMode = state.config.darkMode;

  const [languageExtension, setLanguageExtension] = useState(null);
  const [selectedLangName, setSelectedLangName] = useState(null);

  // Load language extension based on selected language name
  useEffect(() => {
    const loadLanguageByName = async () => {
      const lang = languages.find((l) => l.name === selectedLangName);
      if (lang?.load) {
        const ext = await lang.load();
        setLanguageExtension(ext);
      } else {
        setLanguageExtension(null);
      }
    };

    loadLanguageByName();
  }, [selectedLangName]);

  // Set initial language based on file extension
  useEffect(() => {
    const initialLang = languages.find((l) =>
      l.extensions?.includes(fileExtension)
    );
    if (initialLang) {
      setSelectedLangName(initialLang.name);
    }
  }, [fileExtension]);

  // Build list of extensions
  const extensions = [];
  if (languageExtension) extensions.push(languageExtension);

  // Mount/dismount select in toolbar
  useEffect(() => {
    if (!setToolbarExtras) return;

    const select = (
      <select
        key="lang-select"
        value={selectedLangName || ''}
        style={{ marginLeft: 'auto' }}
        onChange={(e) => setSelectedLangName(e.target.value)}
      >
        {sortedLanguages.map((lang) => (
          <option key={lang.name} value={lang.name}>
            {lang.name}
          </option>
        ))}
      </select>
    );

    setToolbarExtras(select);
    return () => setToolbarExtras(null);
  }, [setToolbarExtras, selectedLangName]);
  
  const [value, setValue] = React.useState(valuePar);
  useEffect(() => {
    setValue(valuePar);
  }, [valuePar]);

  const onChange = React.useCallback((val, viewUpdate) => {
    console.log('val:', val);
    if (onChangePar){
      onChangePar(val);
    };
    setValue(val);
  }, []);
  
  return <div
    ref={wrapperRef}
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    }}
    >
      <CodeMirror 
        value={value} 
        style={{ height: '100%', overflow: 'auto' }}
        height="100%"
        maxHeight="100%" // ← this forces internal scroll
        extensions={extensions}
        onChange={onChange} 
        theme={darkMode ? 'dark' : 'light'}
        />
    </div>;
  
}

