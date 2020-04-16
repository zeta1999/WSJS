import SetupClass from '../main/setup.js';
import DialogBaseClass from '../dialog/dialog_base.js';

export default class DialogDeveloperClass extends DialogBaseClass
{
    constructor(core)
    {
        super(core);
    }
    
        //
        // views
        //
        
    addTestControls(viewDiv)
    {
        this.addInput(viewDiv,'test','Test:','text',null,'blah',null);
        
        /*
        this.addInput(viewDiv,'localGame','Local Game:','checkbox',null,this.core.setup.localGame,this.localGameChange.bind(this));
        this.addInput(viewDiv,'botCount','Local Bot Count:','select',['0','1','2','3','4','5','6','7','8','9'],this.core.setup.botCount,null);
        this.addInput(viewDiv,'botSkill','Local Bot Skill:','select',['Easy','Moderate','Normal','Skilled','Hard'],this.core.setup.botSkill,null);
        this.addInput(viewDiv,'serverURL','Server URL:','text',null,this.core.setup.serverURL,null);
        this.addInput(viewDiv,'savedServerURLList','Saved Server URLs:','select',this.core.setup.savedServerURLList,-1,this.savedServerListPick.bind(this));
        
        this.localGameChange();         // to reset disabled items
            */
    }
    
    addTest2Controls(viewDiv)
    {
        this.addInput(viewDiv,'test2','Test2:','text',null,'blech',null);
        
        /*
        this.addInput(viewDiv,'localGame','Local Game:','checkbox',null,this.core.setup.localGame,this.localGameChange.bind(this));
        this.addInput(viewDiv,'botCount','Local Bot Count:','select',['0','1','2','3','4','5','6','7','8','9'],this.core.setup.botCount,null);
        this.addInput(viewDiv,'botSkill','Local Bot Skill:','select',['Easy','Moderate','Normal','Skilled','Hard'],this.core.setup.botSkill,null);
        this.addInput(viewDiv,'serverURL','Server URL:','text',null,this.core.setup.serverURL,null);
        this.addInput(viewDiv,'savedServerURLList','Saved Server URLs:','select',this.core.setup.savedServerURLList,-1,this.savedServerListPick.bind(this));
        
        this.localGameChange();         // to reset disabled items
            */
    }
    
        //
        // connect dialog
        //
    
    open()
    {
        this.createDialog(['Test','Test2'],0,this.core.setPauseState.bind(this.core,false,false));
        
        this.addTestControls(this.getView('Test'));
        this.addTest2Controls(this.getView('Test2'));
    }
    
    close()
    {
        console.info('here');
        /*
            // change the setup and save
            
        this.core.setup.localGame=document.getElementById('localGame').checked;
        this.core.setup.botCount=document.getElementById('botCount').selectedIndex;
        this.core.setup.botSkill=document.getElementById('botSkill').selectedIndex;
        
        this.core.setup.serverURL=document.getElementById('serverURL').value;
        if (this.core.setup.savedServerURLList.indexOf(this.core.setup.serverURL)===-1) this.core.setup.savedServerURLList.splice(0,0,this.core.setup.serverURL);
        
        this.core.setup.name=document.getElementById('name').value;
        
        this.core.setup.save(this.core);
        */
            // close the dialog
            
        this.removeDialog();
    }

}
