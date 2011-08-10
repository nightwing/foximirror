/**
  gPrefBranch.getChildList('extensions.scriptish')
  gPrefBranch.deleteBranch('extensions.scriptish')

/***********************************************************
 *
 * pref utils
 *****************/
 

function setPref(prefName,val,type){
	var prefBranch = Services.prefs
	try{              
        switch (type||typeof(val)||prefBranch.getPrefType(prefName)){            
			case 'string':  case prefBranch.PREF_STRING:
				return prefBranch.setCharPref(prefName,val);            
			case 'number':  case 'int':  case 'float': case prefBranch.PREF_INT:
				return prefBranch.setIntPref (prefName,val);            
			case 'boolean': case 'bool': case prefBranch.PREF_BOOL:
				return prefBranch.setBoolPref(prefName,val);
			default:
				return 'failed';
        }
    }catch(e){}
}
function clearPref(prefName){
	try{
		//gPrefBranch.prefHasUserValue(prefName)
		Services.prefs.clearUserPref(prefName)
	}catch(e){}
}
function getPref(prefName,type){
	var prefBranch = Services.prefs
	try{
        switch (type||prefBranch.getPrefType(prefName)){            
			case 'string':  case prefBranch.PREF_STRING:
				return prefBranch.getCharPref(prefName);            
			case 'int':     case prefBranch.PREF_INT:
				return prefBranch.getIntPref(prefName);            
			case 'bool':    case prefBranch.PREF_BOOL:
				return prefBranch.getBoolPref(prefName);
        }
    }catch(e){}
}
