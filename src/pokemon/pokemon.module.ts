import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { Pokemon, PokemonSchema } from './entities/pokemon.entity';


@Module({
  
  controllers: [ PokemonController ],
  providers:   [ PokemonService ],
  exports:     [ MongooseModule],
  imports:     [ 
    
    ConfigModule,
    MongooseModule.forFeature([
     { 
       name: Pokemon.name, 
       schema: PokemonSchema 
     }
   ]) 
  ],
})
export class PokemonModule {}
